---
title: "How FluxCD Works"
description: "Personal Understanding of FluxCD"
date: "2022-04-14"
---

# How FluxCD Works

## Bootstrap

Prepare:

- cli access to your github account, via envvar GITHUB_TOKEN and GITHUB_USER
- cli access to a k8s cluster via kubectl
- install flux and check above with `flux check --pre`

Flux bootstrap:

```
flux bootstrap github \
  --owner=$GITHUB_USER \
  --repository=fleet-infra \
  --branch=main \
  --path=./clusters/my-cluster \
  --personal
```

This will:

- create a repo in github, clone it to local.
- generate manifests(gotk-components.yaml) in it, and push to github
- deploy the manifests to k8s cluster
- generate a deploy key pair in k8s, add the public key to this github repo, so k8s can pull your repo every N minutes

gotk: git ops tool kit.

As you can see in output, the manifests defined in `gotk-compontents.yaml` are:

```
deployment "source-controller" successfully rolled out
deployment "kustomize-controller" successfully rolled out
deployment "helm-controller" successfully rolled out
deployment "notification-controller" successfully rolled out
```

Essentially, flux is a repo watcher living in k8s.
When repo changes, it pull the repo and apply the changes, via dispatching them to above controllers.

The repo itself, is a k8s kustomization repo.
In it, flux defines a bunch of its own CDRs.

In k8s, CDR means Custom Resource Definitions, it's a way to define customized k8s resource.

## Kustomizaiton x 2

Please note, flux has its own `Kustomization` resource:

```
apiVersion: kustomize.toolkit.fluxcd.io/v1beta1
kind: Kustomization
...
```

while the k8s Kustomization is:

```
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
...
```

flux Kustomization is used to define a dir (contains a k8s Kustomization.yaml file) in a repo, as target to watch.
while k8s Kustomization is used to include resources.

## Watch itself

Flux can watch itself and apply the changes. So in addition to `gotk-components.yaml`, flux also defines a `gotk-sync.yaml`, which add above created repo as a `GitRepository` resource, and a flux `Kustomization` to points the dir contains root k8s `Kustomization` file. Thus, when you make changes to flux itself, e.g.: customize the cpu limits of the controller pods, flux can update itself.

## Watch others

To let flux watch and deploy other apps in k8s, you have a few ways to organize your code:

### All together

Just add yaml files for other resources in `flux-system/` and refer to them in k8s `kustomization.yaml`. E.g.:

```
# cat flux-system/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - gotk-components.yaml
  - gotk-sync.yaml
  - nginx-ingress.yaml
```

Since the `flux-system/` is already watched, so your changes will be picked up and apply.
This is simplest way, but when files grow, it will be a bit mess.

### Separate apps dir

```
├── apps
│   ├── dashboard.yaml
│   ├── ingress.yaml
│   |── vaultwarden.yaml
|   └── kustomization.yaml
├── flux-system
    ├── gotk-components.yaml
    ├── gotk-sync.yaml
    ├── apps-sync.yaml
    └── kustomization.yaml
```

flow: `flux-system/kustomization.yaml` -> `apps-sync.yaml` -> `apps/kustomization.yaml` -> apps

`apps-sync.yaml` will define a new flux `Kustomization`, on the same `GitRepository`, but points to different dir `apps/`. So when you push anything to `apps/` dir, flux will notice and apply the changes.

### Separate apps repo

Obviously, you can separate your apps files further, into a new repo.
The extra change needed compare to above layout is: you need to add new `GitRepository` resource.
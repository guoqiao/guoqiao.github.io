<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$type = isset($_GET['type']) ? $_GET['type'] : '';

if ($type === 'crypto') {
    $ids = isset($_GET['ids']) ? $_GET['ids'] : 'bitcoin,ethereum';
    $url = 'https://api.coingecko.com/api/v3/simple/price?ids=' . urlencode($ids) . '&vs_currencies=usd';
    $options = [
        'http' => [
            'header' => "User-Agent: Mozilla/5.0 (compatible; MiniDash/1.0)\r\n"
        ]
    ];
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    echo $response;
} elseif ($type === 'weather') {
    // Use provided coordinates or default to Hobsonville
    $lat = isset($_GET['lat']) ? floatval($_GET['lat']) : -36.7833;
    $lon = isset($_GET['lon']) ? floatval($_GET['lon']) : 174.6500;
    $url = "https://api.open-meteo.com/v1/forecast?latitude={$lat}&longitude={$lon}&current_weather=true";
    $response = file_get_contents($url);
    echo $response;
} elseif ($type === 'forex') {
    // Fetch NZD rates
    $nzdUrl = 'https://api.frankfurter.app/latest?from=NZD&to=CNY,USD';
    $nzdResponse = @file_get_contents($nzdUrl);
    $nzdData = json_decode($nzdResponse, true);

    // Fetch USD rates
    $usdUrl = 'https://api.frankfurter.app/latest?from=USD&to=NZD,CNY';
    $usdResponse = @file_get_contents($usdUrl);
    $usdData = json_decode($usdResponse, true);

    $result = [
        'nzd' => [
            'cny' => isset($nzdData['rates']['CNY']) ? $nzdData['rates']['CNY'] : null,
            'usd' => isset($nzdData['rates']['USD']) ? $nzdData['rates']['USD'] : null
        ],
        'usd' => [
            'nzd' => isset($usdData['rates']['NZD']) ? $usdData['rates']['NZD'] : null,
            'cny' => isset($usdData['rates']['CNY']) ? $usdData['rates']['CNY'] : null
        ]
    ];
    echo json_encode($result);
} elseif ($type === 'albums') {
    // List all albums (subdirectories in slides/)
    $slidesDir = __DIR__ . '/slides';
    $albums = [];

    if (is_dir($slidesDir)) {
        $items = scandir($slidesDir);
        foreach ($items as $item) {
            if ($item !== '.' && $item !== '..' && is_dir($slidesDir . '/' . $item)) {
                $albums[] = $item;
            }
        }
    }

    sort($albums);
    echo json_encode(['albums' => $albums]);
} elseif ($type === 'album_photos') {
    // Get photos from a specific album
    $album = isset($_GET['album']) ? $_GET['album'] : '';
    $albumDir = __DIR__ . '/slides/' . basename($album);
    $photos = [];

    if ($album && is_dir($albumDir)) {
        $items = scandir($albumDir);
        foreach ($items as $item) {
            if ($item !== '.' && $item !== '..') {
                $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    $photos[] = 'slides/' . basename($album) . '/' . $item;
                }
            }
        }
    }

    sort($photos);
    echo json_encode(['photos' => $photos]);
} else {
    echo json_encode(['error' => 'Invalid type']);
}

<?php

// remove for production

ini_set('error_reporting', E_ALL & ~E_WARNING & ~E_NOTICE);

$executionStartTime = microtime(true);

header('Content-Type: application/json; charset=UTF-8');

$url = 'http://api.geonames.org/gtopo30JSON?formatted=true&lat=' . $_GET['lat'] . '&lng=' . $_GET['lng'] . '&username=davidboxall&style=full';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

try {
    $output['data'] = $decode;
} catch (Exception $e) {
    $e = null;
    $output['data'] = '{}'; 
}

echo json_encode($output);

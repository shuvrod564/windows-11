<?php
declare(strict_types=1);

// Force error reporting to log quietly to disk instead of polluting stdout
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

class FileStorageProcessor 
{
    private string $allowedDirectory;

    public function __construct(string $relativeAllowedDir = 'assets/md') 
    {
        // Establish an absolute pathway execution context layout boundary
        $this->allowedDirectory = __DIR__ . DIRECTORY_SEPARATOR . ltrim($relativeAllowedDir, '/\\');
    }

    public function processRequest(): void 
    {
        // Intercept and trap early errors/warnings
        ob_start();

        header('Content-Type: application/json; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendResponse(false, 'Invalid Request Protocol Method.');
            return;
        }

        $rawData = file_get_contents('php://input');
        if (empty($rawData)) {
            $this->sendResponse(false, 'Payload stream buffer read is empty.');
            return;
        }

        $payload = json_decode($rawData, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->sendResponse(false, 'Malformed JSON payload data sequence.');
            return;
        }

        if (empty($payload['filename']) || !isset($payload['content'])) {
            $this->sendResponse(false, 'Missing required name or content metrics.');
            return;
        }

        $filename = basename($payload['filename']);
        
        $fileInfo = pathinfo($filename);
        $extension = isset($fileInfo['extension']) ? '.' . $fileInfo['extension'] : '';
        $baseName = $fileInfo['filename'];

        // Strict Regex Check: Does the filename already end with an underscore followed by exactly 10 digits?
        if (preg_match('/_(\d{10})$/', $baseName)) {
            // It is an existing file being edited. Maintain its exact name to overwrite it.
            $finalFilename = $filename;
            $isUpdate = true;
        } else {
            // It is a new or raw asset file. Append a fresh Unix timestamp to create a unique version.
            $finalFilename = $baseName . '_' . time() . $extension;
            $isUpdate = false;
        }
        
        $targetPath = $this->allowedDirectory . DIRECTORY_SEPARATOR . $finalFilename;

        // Perform the write operation
        if (file_put_contents($targetPath, $payload['content']) !== false) {
            $msg = $isUpdate 
                ? sprintf('File updated successfully: %s', $finalFilename) 
                : sprintf('New unique version created successfully: %s', $finalFilename);
            
            $this->sendResponse(true, $msg);
        } else {
            $sysError = error_get_last();
            $this->sendResponse(false, 'Disk Write Aborted: ' . ($sysError['message'] ?? ''));
        }
    }

    private function sendResponse(bool $success, string $message): void 
    {
        // Wipe away any warnings or echoes generated up to this point
        if (ob_get_length()) {
            ob_clean();
        }

        echo json_encode([
            'success'   => $success,
            'message'   => $message,
            'timestamp' => time()
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }
}

$processor = new FileStorageProcessor();
$processor->processRequest();
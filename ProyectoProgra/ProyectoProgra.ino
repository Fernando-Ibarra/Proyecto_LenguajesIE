#include <ESP32Servo.h>
#include "esp_camera.h"
#include <WiFi.h>
#include <ArduinoWebsockets.h>

#define SERVO_1 14
#define SERVO_2 15
#define MOTION_SENSOR_PIN 13
#define SERVO_STEP 1
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

const char *ssid = "TIGO-F53D";
const char *password = "4D9697509107";
const char *websocket_server_host = "192.168.1.4";
const uint16_t websocket_server_port = 65080;
Servo servoN1;
Servo servoN2;
Servo servo1;
Servo servo2;
int servo1Pos = 0;
int servo2Pos = 0;
int motionStateCurrent = LOW;
int motionStatePrevious = LOW;

using namespace websockets;
WebsocketsClient client;
bool movimiento = false;

void onMessageCallback(WebsocketsMessage message)
{
  movimiento = true;
}

void setup()
{
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  pinMode(MOTION_SENSOR_PIN, INPUT); // set ESP32 pin to input mode

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_JPEG;
  // init with high specs to pre-allocate larger buffers
  if (psramFound())
  {
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 40;
    config.fb_count = 2;
  }
  else
  {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK)
  {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");

  // Setup Callbacks
  client.onMessage(onMessageCallback);

  while (!client.connect(websocket_server_host, websocket_server_port, "/"))
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Websocket Connected!");
}

void loop()
{
  // poll
  client.poll();
  camera_fb_t *fb = esp_camera_fb_get();
  motionStatePrevious = motionStateCurrent;
  motionStateCurrent = digitalRead(MOTION_SENSOR_PIN);

  // Para mandar mensaje
  if (motionStatePrevious == LOW && motionStateCurrent == HIGH)
  {
    Serial.println("Motion detected!");
    client.send("email");
  }

  if (movimiento == true)
  {
    esp_camera_fb_return(fb);
    Serial.println("MOVIMIENDO SERVO");
    servo1.setPeriodHertz(50);
    servo2.setPeriodHertz(50); 
    servoN1.attach(2, 1000, 2000);
    servoN2.attach(13, 1000, 2000);
    servo1.attach(SERVO_1, 1000, 2000); 
    servo2.attach(SERVO_2, 1000, 2000);
    servo2.write(180);
    delay(500);
    servo1.write(180);
    delay(2000);
    servo1.write(servo2Pos);
    delay(500);
    servo2.write(servo1Pos);
    esp_camera_fb_return(fb);
    movimiento = false;
  }
  else
  {
    
    if (!fb)
    {
      Serial.println("Camera capture failed");
      esp_camera_fb_return(fb);
      return;
    }

    if (fb->format != PIXFORMAT_JPEG)
    {
      Serial.println("Non-JPEG data not implemented");
      return;
    }

    client.sendBinary((const char *)fb->buf, fb->len);
    esp_camera_fb_return(fb);
  }
  
}

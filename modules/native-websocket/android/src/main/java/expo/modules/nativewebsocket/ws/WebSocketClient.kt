package expo.modules.nativewebsocket.ws

import com.google.gson.Gson
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.Headers
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

public class WebSocketClient(
    private val url: String,
    private val headers: Map<String, String> = emptyMap(),
    private val reconnectInterval: Long = 10L,
    private val maxRetries: Int = 5
) {

    // コアとなるOkHttpClient
    private val client = OkHttpClient.Builder()
        .connectTimeout(0, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.SECONDS)
        .writeTimeout(0, TimeUnit.SECONDS)
        .build()

    // WebSocketのインスタンスを保持する変数
    private var webSocket: WebSocket? = null

    // 再接続試行回数のカウンタ
    private var retryCount = 0

    // ユーザーが意図的に切断したかを判定するフラグ
    private var shouldReconnect = true

    // 再接続処理のためのスケジューラ
    private val scheduler = Executors.newSingleThreadScheduledExecutor()


    // WebSocketイベントを処理するリスナー
    private var webSocketListener: WebSocketListener = object : WebSocketListener() {
        // サーバーと接続が確立した時に呼ばれる
        override fun onOpen(webSocket: WebSocket, response: Response) {
            // 接続に成功したらリトライカウントをリセット
            retryCount = 0
        }

        // サーバーからテキストメッセージを受信した時に呼ばれる
        override fun onMessage(webSocket: WebSocket, text: String) {
            println("Receiving: $text")
        }

        // サーバーからバイナリメッセージを受信した時に呼ばれる
        override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
            println("Receiving bytes: ${bytes.hex()}")
        }

        // 接続が閉じる時に呼ばれる
        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
            println("Closing: $code / $reason")
        }

        // 接続が完全に閉じた時に呼ばれる
        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            // 意図しない切断の場合のみ再接続を試みる
            if (shouldReconnect) {
                scheduleReconnect()
            }
        }

        // 通信エラーや接続失敗時に呼ばれる
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            // 意図しない切断の場合のみ再接続を試みる
            if (shouldReconnect) {
                scheduleReconnect()
            }
        }
    }


    /**
     * 追加のリスナー登録
     */
    fun setListener(onMessage: (String) -> Unit) {
        val newListener: WebSocketListener = object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                this@WebSocketClient.webSocketListener.onMessage(webSocket, text)
                onMessage(text)
            }
        }
        this.webSocketListener = newListener
    }

    /**
     * WebSocketサーバーへの接続を開始する
     */
    fun connect() {
        if (webSocket != null) {
            println("Already connected or connecting.")
            return
        }
        println("Connecting to WebSocket...")
        shouldReconnect = true

        // 初回接続時のHTTPリクエストを作成
        val request = Request.Builder()
            .url(url)
            .headers(Headers.headersOf(*headers.toList().flatMap { (k, v) -> listOf(k, v) }.toTypedArray()))
            .build()

        // WebSocketを新規作成
        webSocket = client.newWebSocket(request, webSocketListener)
    }

    /**
     * 再接続をスケジュールする
     */
    private fun scheduleReconnect() {
        if (retryCount >= maxRetries) {
            println("Could not reconnect after $maxRetries attempts. Giving up.")
            return
        }

        retryCount++
        println("Connection lost. Will attempt to reconnect in $reconnectInterval seconds... (Attempt $retryCount/$maxRetries)")

        scheduler.schedule({
            webSocket = null
            connect()
        }, reconnectInterval, TimeUnit.SECONDS)
    }

    /**
     * メッセージをサーバーに送信する
     */
    fun sendMessage(message: String): Boolean {
        return webSocket?.send(message) ?: false.also {
            println("Cannot send message, WebSocket is not connected.")
        }
    }

    /**
     * 接続を正常に切断する
     */
    fun disconnect() {
        if (webSocket != null) {
            println("Disconnecting...")
            shouldReconnect = false
            webSocket?.close(1000, "Client disconnected")
            webSocket = null
        }
    }

    /**
     * クライアントをシャットダウンする
     */
    fun shutdown() {
        disconnect()
        scheduler.shutdown()
        client.dispatcher.executorService.shutdown()
    }

    fun tmp() : String {
        println("tmp")

        return "tmp"
    }

}


fun main() {
    val wsUrl = "wss://dummy-ws.ktrn.dev"
    val client = WebSocketClient(wsUrl)
    client.setListener { message ->
        println("Received message: $message")
    }

    // 接続開始
    client.connect()

    // 15秒後にメッセージを送信してみる
    Thread.sleep(15_000)
    val sent = client.sendMessage("Hello, WebSocket!")
    println("Message sent successfully: $sent")


    // 30秒後に切断
    Thread.sleep(15_000)
    client.disconnect()


    // 完全にシャットダウン
    client.shutdown()
}
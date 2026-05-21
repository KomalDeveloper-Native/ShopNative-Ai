package com.shopnative_ai

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.messaging.FirebaseMessaging

class PushNotificationModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "PushNotification"

  @ReactMethod
  fun registerDevice(promise: Promise) {
    createDefaultChannel(reactContext)

    FirebaseMessaging.getInstance().token
      .addOnSuccessListener { token ->
        reactContext
          .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
          .edit()
          .putString(KEY_FCM_TOKEN, token)
          .apply()

        promise.resolve(token)
      }
      .addOnFailureListener { error ->
        promise.reject("push_token_error", error.message, error)
      }
  }

  @ReactMethod
  fun getCachedToken(promise: Promise) {
    val token = reactContext
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_FCM_TOKEN, null)

    promise.resolve(token)
  }

  companion object {
    const val CHANNEL_ID = "shopnative_updates"
    private const val CHANNEL_NAME = "ShopNative updates"
    private const val PREFS_NAME = "shopnative_push_notifications"
    private const val KEY_FCM_TOKEN = "fcmToken"

    fun createDefaultChannel(context: Context) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        return
      }

      val notificationManager = context.getSystemService(NotificationManager::class.java)
      val existingChannel = notificationManager.getNotificationChannel(CHANNEL_ID)

      if (existingChannel != null) {
        return
      }

      val channel = NotificationChannel(
        CHANNEL_ID,
        CHANNEL_NAME,
        NotificationManager.IMPORTANCE_DEFAULT,
      ).apply {
        description = "Price drops, order updates and ShopNative alerts"
      }

      notificationManager.createNotificationChannel(channel)
    }
  }
}

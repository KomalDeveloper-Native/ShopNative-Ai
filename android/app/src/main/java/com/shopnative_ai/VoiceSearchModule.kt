package com.shopnative_ai

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import java.util.Locale

class VoiceSearchModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private var speechRecognizer: SpeechRecognizer? = null
  private var activePromise: Promise? = null

  override fun getName(): String = "VoiceSearch"

  @ReactMethod
  fun startListening(promise: Promise) {
    if (activePromise != null) {
      promise.reject("voice_search_busy", "Voice search is already listening.")
      return
    }

    if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
      promise.reject("voice_search_unavailable", "Speech recognition is not available on this device.")
      return
    }

    activePromise = promise

    UiThreadUtil.runOnUiThread {
      val recognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
      speechRecognizer = recognizer

      recognizer.setRecognitionListener(object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) = Unit
        override fun onBeginningOfSpeech() = Unit
        override fun onRmsChanged(rmsdB: Float) = Unit
        override fun onBufferReceived(buffer: ByteArray?) = Unit
        override fun onEndOfSpeech() = Unit
        override fun onEvent(eventType: Int, params: Bundle?) = Unit
        override fun onPartialResults(partialResults: Bundle?) = Unit

        override fun onResults(results: Bundle?) {
          val matches = results
            ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            .orEmpty()
          val transcript = matches.firstOrNull()?.trim().orEmpty()

          if (transcript.isBlank()) {
            rejectAndReset("voice_search_no_match", "I could not hear a searchable phrase.")
          } else {
            activePromise?.resolve(transcript)
            resetRecognizer()
          }
        }

        override fun onError(error: Int) {
          val message = when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "The microphone could not capture audio."
            SpeechRecognizer.ERROR_CLIENT -> "Voice search stopped before it finished."
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission is required for voice search."
            SpeechRecognizer.ERROR_NETWORK -> "Network audio recognition failed."
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Voice recognition timed out on the network."
            SpeechRecognizer.ERROR_NO_MATCH -> "I could not match that speech to a search."
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "The speech recognizer is busy. Try again in a moment."
            SpeechRecognizer.ERROR_SERVER -> "The speech recognition service had a problem."
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "I did not hear anything."
            else -> "Voice search could not finish."
          }

          rejectAndReset("voice_search_error", message)
        }
      })

      val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        putExtra(RecognizerIntent.EXTRA_PROMPT, "Search ShopNative")
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
        putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
      }

      recognizer.startListening(intent)
    }
  }

  @ReactMethod
  fun stopListening(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      speechRecognizer?.stopListening()
      resetRecognizer()
      promise.resolve(null)
    }
  }

  private fun rejectAndReset(code: String, message: String) {
    activePromise?.reject(code, message)
    resetRecognizer()
  }

  private fun resetRecognizer() {
    speechRecognizer?.destroy()
    speechRecognizer = null
    activePromise = null
  }

  override fun invalidate() {
    resetRecognizer()
    super.invalidate()
  }
}

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastAudioUri, setLastAudioUri] = useState(null);

  const startRecording = async () => {
    try {
      console.log('[AudioRecorder] Запит дозволів...');
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        console.warn('[AudioRecorder] Дозвіл на мікрофон не надано!');
        return;
      }

      console.log('[AudioRecorder] Налаштування аудіосесії...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const RECORDING_OPTIONS_PCM = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      };

      console.log('[AudioRecorder] Запуск запису...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS_PCM
      );

      setRecording(newRecording);
      setIsRecording(true);
      console.log('[AudioRecorder] Запис успішно розпочато!');
    } catch (err) {
      console.error('[AudioRecorder] Помилка старту запису:', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('[AudioRecorder] Зупинка запису...');
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('[AudioRecorder] Файл збережено:', uri);

      setLastAudioUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('[AudioRecorder] Помилка зупинки запису:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Clean Audio Recorder</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isRecording ? '🔴 ІДЕ ЗАПИС (WAV 44.1kHz)' : '⚪ Готовий до запису'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isRecording ? styles.buttonStop : styles.buttonStart]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'ЗУПИНИТИ' : 'ЗАПИСАТИ'}
        </Text>
      </TouchableOpacity>

      {lastAudioUri && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Останній файл:</Text>
          <Text style={styles.resultUri}>{lastAudioUri}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 40,
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  buttonStart: {
    backgroundColor: '#22c55e',
  },
  buttonStop: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    width: '100%',
  },
  resultLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  resultUri: {
    color: '#38bdf8',
    fontSize: 12,
  },
});

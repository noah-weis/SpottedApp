import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebaseConfig';
import { doc, setDoc } from "firebase/firestore";
import { db } from './firebaseConfig';

async function pickImage() {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri; // local file path
  }

  return null;
}

async function uriToBlob(uri) {
    const response = await fetch(uri);
    return await response.blob();
  }

async function uploadImage(uri, groupId, userId) {
  const blob = await uriToBlob(uri);
  const imageRef = ref(storage, `groups/${groupId}/${userId}_${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);
  return await getDownloadURL(imageRef);
}

async function saveImageMetadata(url, groupId, userId) {
  const id = `${userId}_${Date.now()}`;
  const docRef = doc(db, "groups", groupId, "images", id);
  await setDoc(docRef, {
    url,
    userId,
    timestamp: Date.now()
  });
}

async function handleCapture(groupId, userId) {
    const uri = await pickImage();
    if (!uri) return;
  
    const url = await uploadImage(uri, groupId, userId);
    await saveImageMetadata(url, groupId, userId);
  }
  

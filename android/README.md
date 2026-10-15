# FoodLink Android app

Native Android application ID/package: `ke.co.foodlink.app`

Backend project: `foodlink3-3081a`

## Connect this app to Firebase

1. Open [Firebase Console](https://console.firebase.google.com/) and select project `foodlink3-3081a`.
2. Open Project settings → General → Your apps → Add app → Android.
3. Register the exact package name `ke.co.foodlink.app`. Package names are case-sensitive and cannot be changed for that Firebase app after registration.
4. Download `google-services.json` and put it at `android/app/google-services.json` (not in the repository unless your project policy permits tracking this non-secret config; never add service-account keys).
5. In Project settings, add the SHA-1 and SHA-256 fingerprints for the debug and release signing certificates.
6. Under Authentication → Sign-in method, enable Email/Password and Google. Set a support email for Google sign-in.
7. Download a fresh `google-services.json` after enabling Google so the OAuth client information is included.
8. In Firestore, create the database and deploy the repository's `firestore.rules`.
9. Open the `android` directory in Android Studio, sync Gradle, then run on a device or emulator with Google Play services.

## Authentication included

- Email/password account creation and sign-in.
- Google sign-in through Android Credential Manager and Firebase Authentication.
- Customer profile creation in Firestore at `profiles/{uid}`, defaulting to the customer role.

## Important

This is the first native authentication scaffold, not a complete customer ordering app yet. The existing Next.js website is still in the repository. Do not commit Firebase service-account credentials. The Android build cannot authenticate until the Firebase Android app is registered and its actual `google-services.json` is added locally.

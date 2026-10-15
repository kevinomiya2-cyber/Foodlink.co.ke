package ke.co.foodlink.app

import android.os.Bundle
import android.graphics.Color
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.lifecycle.lifecycleScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class MainActivity : ComponentActivity() {
    private val auth by lazy { FirebaseAuth.getInstance() }
    private val db by lazy { FirebaseFirestore.getInstance() }
    private lateinit var nameInput: EditText
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var status: TextView
    private var signupMode = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        render()
    }

    private fun render() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(36, 48, 36, 36)
            setBackgroundColor(Color.rgb(248, 246, 239))
        }
        root.addView(TextView(this).apply {
            text = "FoodLink"
            textSize = 32f
            setTextColor(Color.rgb(52, 75, 56))
        })
        root.addView(TextView(this).apply {
            text = "Good food works better together."
            textSize = 17f
            setTextColor(Color.rgb(80, 90, 78))
            setPadding(0, 8, 0, 24)
        })
        nameInput = EditText(this).apply { hint = "Full name (for new accounts)" }
        emailInput = EditText(this).apply {
            hint = "Email address"
            inputType = 33
        }
        passwordInput = EditText(this).apply {
            hint = "Password (at least 8 characters)"
            inputType = 129
        }
        root.addView(nameInput, fieldParams())
        root.addView(emailInput, fieldParams())
        root.addView(passwordInput, fieldParams())
        root.addView(actionButton("Create account") { signupMode = true; emailPasswordAction() }, fieldParams())
        root.addView(actionButton("Sign in with email") { signupMode = false; emailPasswordAction() }, fieldParams())
        root.addView(actionButton("Continue with Google") { googleSignIn() }, fieldParams())
        status = TextView(this).apply {
            textSize = 14f
            setTextColor(Color.rgb(52, 75, 56))
            setPadding(0, 20, 0, 0)
        }
        root.addView(status, fieldParams())
        setContentView(root)
    }

    private fun fieldParams() = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    ).apply { bottomMargin = 12 }

    private fun actionButton(label: String, action: () -> Unit) = Button(this).apply {
        text = label
        setOnClickListener { action() }
    }

    private fun emailPasswordAction() {
        val email = emailInput.text.toString().trim()
        val password = passwordInput.text.toString()
        if (email.isBlank() || password.length < 8) {
            status.text = "Enter a valid email and a password with at least 8 characters."
            return
        }
        lifecycleScope.launch {
            try {
                val user = if (signupMode) {
                    val name = nameInput.text.toString().trim()
                    if (name.length < 2) throw IllegalArgumentException("Enter your full name.")
                    auth.createUserWithEmailAndPassword(email, password).await().user
                        ?: throw IllegalStateException("Account creation returned no user.")
                } else {
                    auth.signInWithEmailAndPassword(email, password).await().user
                        ?: throw IllegalStateException("Sign-in returned no user.")
                }
                if (signupMode) user.updateProfile(
                    com.google.firebase.auth.UserProfileChangeRequest.Builder()
                        .setDisplayName(nameInput.text.toString().trim()).build()
                ).await()
                saveCustomerProfile(user.uid, user.displayName ?: nameInput.text.toString().trim(), user.email, user.isEmailVerified)
                status.text = "Signed in as ${user.email}. FoodLink account is ready."
            } catch (e: Exception) {
                status.text = e.localizedMessage ?: "Authentication failed. Check Firebase setup."
            }
        }
    }

    private fun googleSignIn() {
        lifecycleScope.launch {
            try {
                val googleOption = GetGoogleIdOption.Builder()
                    .setServerClientId(getString(R.string.default_web_client_id))
                    .setFilterByAuthorizedAccounts(false)
                    .build()
                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleOption)
                    .build()
                val result = CredentialManager.create(this@MainActivity).getCredential(this@MainActivity, request)
                val credential = result.credential
                if (credential !is CustomCredential ||
                    credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) throw IllegalStateException("Google did not return a valid sign-in credential.")
                val googleCredential = GoogleIdTokenCredential.createFrom(credential.data)
                val firebaseCredential = GoogleAuthProvider.getCredential(googleCredential.idToken, null)
                val user = auth.signInWithCredential(firebaseCredential).await().user
                    ?: throw IllegalStateException("Google sign-in returned no user.")
                saveCustomerProfile(user.uid, user.displayName ?: "FoodLink customer", user.email, user.isEmailVerified)
                status.text = "Signed in with Google as ${user.email}."
            } catch (e: GetCredentialException) {
                status.text = e.localizedMessage ?: "Google sign-in was cancelled or could not start."
            } catch (e: Exception) {
                status.text = e.localizedMessage ?: "Google sign-in failed. Check Firebase provider settings."
            }
        }
    }

    private suspend fun saveCustomerProfile(uid: String, name: String, email: String?, verified: Boolean) {
        val ref = db.collection("profiles").document(uid)
        val existing = ref.get().await()
        if (!existing.exists()) {
            ref.set(
                mapOf(
                    "uid" to uid,
                    "fullName" to name,
                    "email" to email,
                    "phone" to "",
                    "role" to "customer",
                    "isVerified" to verified,
                    "createdAt" to FieldValue.serverTimestamp(),
                    "updatedAt" to FieldValue.serverTimestamp()
                ),
                SetOptions.merge()
            ).await()
        }
    }
}

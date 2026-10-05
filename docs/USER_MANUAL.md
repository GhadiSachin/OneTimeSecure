# OneTime Secure: User Manual

Welcome to OneTime Secure. This guide will show you how to securely share sensitive information like passwords, API keys, and environment variables.

## Creating a Secret

1. Navigate to the OneTime Secure homepage.
2. You will see a secure input box labeled **"New Secret"**.
3. Type or paste your sensitive information into the text area.
4. Click the **"Generate Secure Link"** button.
5. The application will encrypt your text locally in your browser.
6. A success message will appear displaying your unique, one-time link.
7. Click the **Copy** button to copy the link to your clipboard.

*Note: The generated link contains the decryption key. Treat this link like a password. Do not send it over insecure channels where it might be intercepted and clicked by third-party scanners.*

## Viewing a Secret

1. When you receive a OneTime Secure link, open it in your web browser.
2. You will be greeted by a "Secure Secret Received" prompt warning you that the secret can only be viewed once.
3. Click **"Decrypt & View Secret"**.
4. The application will securely retrieve the encrypted data and decrypt it directly in your browser.
5. The sensitive text will appear on the screen.
6. **Immediately copy and save the secret**. 
7. If you refresh the page, navigate away, or close the tab, the secret is permanently gone and cannot be recovered.

## Troubleshooting

- **"Secret Unavailable" / "Secret Gone":** If you see this error when opening a link, it means the secret has either expired or has already been opened by someone else. For security reasons, you must ask the sender to generate a new link.

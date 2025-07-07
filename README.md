# Profile Upload App

A modern React application for creating and managing user profiles with image upload functionality to Azure Blob Storage.

## ✨ Features

- **Profile Management**: Create and edit user profiles with name and bio
- **Image Upload**: Upload and compress profile images
- **Azure Integration**: Seamless integration with Azure Blob Storage
- **Progress Tracking**: Real-time upload progress indicator
- **Image Compression**: Automatic image optimization for better performance
- **Responsive Design**: Modern dark theme UI built with Tailwind CSS
- **Preview Functionality**: Live preview of profile images before upload

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0
- **Build Tool**: Vite 7.0.0
- **Styling**: Tailwind CSS 4.1.11
- **Image Processing**: browser-image-compression
- **Cloud Storage**: Azure Blob Storage
- **Code Quality**: ESLint

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (version 18 or higher)
- npm or yarn package manager
- Azure Storage Account with Blob Storage container
- Valid Azure SAS (Shared Access Signature) token

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd profile-upload-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Azure Storage**

   Update the `sasContainerUrl` in `src/components/ProfileCard.jsx` with your Azure Blob Storage container URL and SAS token:

   ```javascript
   const sasContainerUrl = "YOUR_AZURE_BLOB_STORAGE_URL_WITH_SAS_TOKEN";
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5173`
and you can view it in your browser.

## 🎯 Key Components

### ProfileCard Component

The main component that handles:

- Profile image upload and compression
- Form validation and submission
- Progress tracking during upload
- Azure Blob Storage integration
- Edit/view mode toggling

**Key Features:**

- Image compression (max 1MB, 600px max dimension)
- Progress bar during upload
- Error handling for failed uploads
- Responsive design

## ⚙️ Configuration

### Azure Blob Storage Setup

1. Create an Azure Storage Account
2. Create a Blob container
3. Generate a SAS token with the following permissions:

   - **Permissions**: Create, Write
   - **Allowed protocols**: HTTPS only
   - **Expiry time**: Set according to your needs

4. Update the `sasContainerUrl` in the ProfileCard component

### Image Compression Settings

The app automatically compresses images with these settings:

- Maximum file size: 1MB
- Maximum dimensions: 600px (width or height)
- Uses web workers for better performance

## 🔧 Customization

### Styling

The app uses Tailwind CSS for styling. You can customize the appearance by modifying the classes in the components or extending the Tailwind configuration.

### Image Upload Settings

Modify the compression options in `ProfileCard.jsx`:

```javascript
const options = {
  maxSizeMB: 1, // Maximum file size in MB
  maxWidthOrHeight: 600, // Maximum dimension in pixels
  useWebWorker: true, // Use web workers for compression
};
```

## 🚨 Important Security Notes

- **SAS Token Expiry**: The current SAS token in the code will expire on July 7, 2025. Make sure to update it before expiry.
- **Environment Variables**: Consider moving sensitive configuration like Azure URLs to environment variables for production use.
- **CORS Configuration**: Ensure your Azure Storage account has proper CORS settings configured.

## 🛡️ Error Handling

The application includes comprehensive error handling for:

- Image compression failures
- Upload failures
- Network errors
- Validation errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ using React and Azure

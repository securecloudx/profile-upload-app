# Profile Upload App

A modern React application for creating and managing user profiles with image upload functionality to Azure Blob Storage.

## ✨ Features

- **Profile Management**: Create and edit user profiles with name and bio
- **Image Upload**: Upload and compress profile images with drag-and-drop support
- **Azure Integration**: Seamless integration with Azure Blob Storage
- **Progress Tracking**: Real-time upload progress with file size and duration display
- **Image Compression**: Automatic image optimization with toggle control and size comparison
- **Theme Switcher**: Dark/light theme toggle with persistent preferences
- **Instant Preview**: Live preview of profile images with immediate feedback
- **File Size Comparison**: Shows original vs compressed file sizes with savings percentage
- **Data Persistence**: All profile data and preferences persist across browser reloads
- **Drag & Drop**: Intuitive drag-and-drop image upload with visual feedback
- **Responsive Design**: Modern UI built with Tailwind CSS and smooth animations
- **Reset Functionality**: One-click profile reset with confirmation dialog

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0 with Hooks (useState, useEffect)
- **Build Tool**: Vite 7.0.0 with Hot Module Replacement
- **Styling**: Tailwind CSS 4.1.11 with dark/light theme support
- **Image Processing**: browser-image-compression with web workers
- **Local Storage**: Browser localStorage for data persistence
- **Cloud Storage**: Azure Blob Storage with SAS token authentication
- **Code Quality**: ESLint with modern JavaScript standards

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

- **Profile Data Management**: Name, bio, and image with localStorage persistence
- **Image Upload & Processing**: Drag-and-drop upload with compression and instant preview
- **File Size Analysis**: Original vs compressed size comparison with savings calculation
- **Theme Management**: Dark/light theme toggle with user preference persistence
- **Upload Progress**: Real-time progress tracking with file size and duration metrics
- **Azure Blob Storage**: Direct upload integration with SAS token authentication
- **State Management**: Smart state handling with automatic localStorage sync
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **UI/UX Features**: Smooth animations, visual feedback, and responsive design

**Key Interactions:**

- **Edit Mode**: Click "Edit Profile" to enable form fields and image upload
- **Image Upload**: Click pencil icon or drag-and-drop images for upload
- **Theme Toggle**: Sun/moon icon to switch between dark and light themes
- **Compression Toggle**: Package icon to enable/disable image compression
- **Reset Profile**: Trash icon to clear all data with confirmation dialog
- **Instant Feedback**: Real-time preview and immediate visual responses

## ⚙️ Configuration

### Data Persistence

The app automatically saves and restores:

- **Profile Information**: Name, bio, and profile image URL
- **User Preferences**: Theme (dark/light) and compression settings
- **Upload Statistics**: File sizes, compression savings, and upload duration
- **Success Messages**: Recent upload confirmations (expire after 5 minutes)

All data is stored in browser localStorage and automatically loaded on page refresh.

### Azure Blob Storage Setup

1. Create an Azure Storage Account
2. Create a Blob container
3. Generate a SAS token with the following permissions:

   - **Permissions**: Create, Write
   - **Allowed protocols**: HTTPS only
   - **Expiry time**: Set according to your needs

4. Update the `sasContainerUrl` in the ProfileCard component

### Image Compression Settings

The app includes a compression toggle with these default settings:

- **When Enabled**: Maximum file size: 1MB, Maximum dimensions: 600px
- **When Disabled**: Original file size preserved
- **Performance**: Uses web workers for non-blocking compression
- **Feedback**: Shows original vs compressed size comparison with savings percentage

### Theme Configuration

- **Default Theme**: Dark mode
- **Toggle Control**: Sun/moon icon in settings panel
- **Persistence**: Theme preference saved in localStorage
- **Smooth Transitions**: 300ms duration for all theme changes

## 🔧 Customization

### User Interface

The app features a modern, responsive design with:

- **Theme System**: Dark and light themes with user toggle
- **Settings Panel**: Theme, compression, and reset controls
- **Progress Indicators**: Animated upload progress with percentage and file info
- **Visual Feedback**: Drag-and-drop zones, hover effects, and state transitions
- **Error Handling**: Inline validation messages and user-friendly error states

### Upload Behavior

Customize the upload experience by modifying settings in `ProfileCard.jsx`:

```javascript
// Image compression options
const options = {
  maxSizeMB: 1, // Maximum file size in MB
  maxWidthOrHeight: 600, // Maximum dimension in pixels
  useWebWorker: true, // Use web workers for compression
};

// File validation
const maxSizeMB = 2; // Maximum upload size before compression
const validTypes = ["image/jpeg", "image/png"]; // Allowed file types
```

### Data Persistence

Control what data persists by modifying the localStorage keys:

```javascript
// Profile data keys
const profileKeys = [
  "profileName", "profileBio", "profilePreview", "profileUploadUrl",
  "profileDarkTheme", "profileCompressionEnabled", "profileUploadDuration",
  "profileOriginalSize", "profileCompressedSize", "profileSuccessMessage"
];
```

### Styling

The app uses Tailwind CSS for styling. You can customize the appearance by:

- Modifying component classes for colors, spacing, and animations
- Extending the Tailwind configuration for custom design tokens
- Adjusting theme-specific color schemes in the component conditionals

## 🚨 Important Security Notes

- **SAS Token Expiry**: The current SAS token in the code will expire on July 7, 2025. Make sure to update it before expiry.
- **Environment Variables**: Consider moving sensitive configuration like Azure URLs to environment variables for production use.
- **CORS Configuration**: Ensure your Azure Storage account has proper CORS settings configured.

## 🛡️ Error Handling

The application includes comprehensive error handling for:

- **Image Validation**: File type and size validation with clear error messages
- **Compression Failures**: Graceful fallback when image compression fails
- **Upload Errors**: Network and server error handling with retry suggestions
- **Form Validation**: Real-time validation for required fields
- **localStorage Issues**: Fallback to default values when storage fails
- **Browser Compatibility**: Graceful degradation for unsupported features

## 🎮 User Experience Features

### Drag & Drop

- Visual feedback when dragging files over the upload area
- Prevents browser default file opening behavior
- Works only in edit mode for better UX

### File Size Intelligence

- Shows original file size before compression
- Displays compressed file size after processing
- Calculates and shows savings in KB and percentage
- Adapts display based on compression settings

### Persistent State

- All form data survives page refreshes
- Theme and compression preferences remembered
- Recent upload success messages persist (5-minute expiry)
- One-click reset to clear all stored data

### Progress Tracking

- Real-time upload progress bar with animation
- File size display during upload
- Upload duration tracking and display
- Success confirmation with detailed statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

If you find this project interesting, consider giving it a star⭐

Made with ❤️ using React, Azure, and modern web technologies

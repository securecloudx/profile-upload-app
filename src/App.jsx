import Footer from "./components/Footer";
import ProfileForm from "./components/ProfileCard";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <main className="flex-1 flex">
        <ProfileForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
// Note: Ensure you have the necessary CORS settings on your Azure Blob Storage to allow uploads from your domain.

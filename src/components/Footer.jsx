export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm py-4 text-center border-t border-gray-800">
      <p>
        © {new Date().getFullYear()} Profile Upload App by{" "}
        <a
          href="https://github.com/0tieno"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Ronney Otieno
        </a>
      </p>
    </footer>
  );
}

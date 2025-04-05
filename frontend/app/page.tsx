import ENSRegistrationForm from "../components/ENSRegistrationForm";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          ENS Domain Registration
        </h1>
        <ENSRegistrationForm />
      </div>
    </main>
  );
}

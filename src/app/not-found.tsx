import Link from "next/link";

export const metadata = { title: "Η σελίδα δεν βρέθηκε", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[980px] bg-black/70 px-6 py-24 text-center">
      <h1 className="font-script text-[32px]">Η σελίδα δεν βρέθηκε</h1>
      <p className="mt-4 text-[16px]">Η σελίδα που ζητήσατε δεν υπάρχει ή έχει μετακινηθεί.</p>
      <p className="mt-6">
        <Link href="/" className="inline-block bg-green-3 px-6 py-2 text-[15px] text-green-5 hover:bg-green-2">
          Επιστροφή στην αρχική
        </Link>
      </p>
    </section>
  );
}

export default function FieldError({ message }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-2 text-xs font-semibold text-red-500">
      {message}
    </p>
  );
}

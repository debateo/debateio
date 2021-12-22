import Link from "next/link";

export default function Ask() {
  function handleSubmit(event) {
    event.preventDefault();
    console.log("question submitted");
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-gray-700">Textarea</span>
          <textarea
            className="form-textarea mt-1 block w-full"
            rows="3"
            placeholder="Enter some long form content."
          ></textarea>
        </label>
      </form>
    </>
  );
}

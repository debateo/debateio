function Header() {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">Debate.io</span>
      </div>
      <div className="block lg:hidden flex justify-center">
        <button className="flex items-center px-3 py-2 border rounded text-white border-teal-400 hover:text-white hover:border-white">
          Login
        </button>
        <button className="flex items-center px-3 py-2 border rounded text-white border-teal-400 hover:text-white hover:border-white mx-5">
          Register
        </button>
      </div>
    </nav>
  );
}

export default Header;

interface PageTitleProps {
  title: string;
}

const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <div className="w-full">
      <header className="w-screen bg-[#F6F6F8] text-[#141414] py-14 px-6">
        <div className="flex justify-center items-center">
          <h1 className="text-4xl font-semibold tracking-widest">{title}</h1>
        </div>
      </header>
    </div>
  );
};

export default PageTitle;

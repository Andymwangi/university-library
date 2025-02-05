import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { auth } from "@/auth";
import { sampleBooks } from "@/constants";

const Home = async () => {
  const session = await auth();
  return (
    <>
      <BookOverview {...sampleBooks[0]}/>

      <BookList
        title="Latest Books"
        books={sampleBooks}
        containerClassName="mt-28"
      />
    </>
  );
};

export default Home;

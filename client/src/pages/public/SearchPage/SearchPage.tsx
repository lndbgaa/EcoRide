import SearchForm from "@/components/SearchForm/SearchForm";

import styles from "./SearchPage.module.css";

const SearchPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Quelle est votre prochaine destination ?</h1>

        <SearchForm />
      </div>
    </div>
  );
};

export default SearchPage;

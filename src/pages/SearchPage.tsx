
import { SearchPage as SearchPageComponent } from '@/components/search/SearchPage';
import PullToRefresh from 'react-pull-to-refresh';

const SearchPage = () => {
  return (
    <PullToRefresh onRefresh={() => window.location.reload()}>
      <div className="min-h-screen bg-[#000000]">
        <SearchPageComponent />
      </div>
    </PullToRefresh>
  );
};

export default SearchPage;

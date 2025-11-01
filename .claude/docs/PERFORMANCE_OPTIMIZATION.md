# React 성능 최적화 전략

## 개요
React 애플리케이션의 성능을 최적화하기 위한 실전 가이드

## 1. 리렌더링 최적화

### React.memo
**불필요한 리렌더링 방지**

```typescript
// ❌ 나쁨: 부모 컴포넌트가 리렌더링될 때마다 함께 리렌더링
function EventCard({ event }: { event: Event }) {
  return <div>{event.title}</div>;
}

// ✅ 좋음: props가 변경될 때만 리렌더링
const EventCard = React.memo(({ event }: { event: Event }) => {
  return <div>{event.title}</div>;
});

// ✅ 더 좋음: 커스텀 비교 함수
const EventCard = React.memo(
  ({ event }: { event: Event }) => {
    return <div>{event.title}</div>;
  },
  (prevProps, nextProps) => {
    // true를 반환하면 리렌더링 안 함
    return prevProps.event.id === nextProps.event.id;
  }
);
```

### useMemo
**비싼 계산 결과 메모이제이션**

```typescript
// ❌ 나쁨: 매 렌더링마다 계산
function CalendarView({ events, currentDate }) {
  const weeks = getWeeksAtMonth(currentDate); // 매번 계산
  const filteredEvents = events.filter(e =>
    isInMonth(e.date, currentDate)
  ); // 매번 필터링

  return <CalendarGrid weeks={weeks} events={filteredEvents} />;
}

// ✅ 좋음: 의존성이 변경될 때만 계산
function CalendarView({ events, currentDate }) {
  const weeks = useMemo(
    () => getWeeksAtMonth(currentDate),
    [currentDate]
  );

  const filteredEvents = useMemo(
    () => events.filter(e => isInMonth(e.date, currentDate)),
    [events, currentDate]
  );

  return <CalendarGrid weeks={weeks} events={filteredEvents} />;
}
```

### useCallback
**함수 메모이제이션**

```typescript
// ❌ 나쁨: 매 렌더링마다 새 함수 생성
function EventList({ events }) {
  const handleDelete = (id: string) => {
    deleteEvent(id);
  };

  return events.map(event => (
    // EventItem이 매번 리렌더링됨
    <EventItem key={event.id} event={event} onDelete={handleDelete} />
  ));
}

// ✅ 좋음: 함수를 메모이제이션
function EventList({ events }) {
  const handleDelete = useCallback((id: string) => {
    deleteEvent(id);
  }, []); // 의존성 없음

  return events.map(event => (
    // EventItem이 props 변경 시에만 리렌더링
    <EventItem key={event.id} event={event} onDelete={handleDelete} />
  ));
}
```

## 2. 코드 스플리팅

### 라우트 레벨 지연 로딩

```typescript
// ❌ 나쁨: 모든 페이지를 한 번에 로드
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

// ✅ 좋음: 라우트별로 분리
const Home = lazy(() => import('./pages/Home'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 무거운 컴포넌트 동적 임포트

```typescript
// ✅ 모달이 열릴 때만 로드
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ModalComponent, setModalComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (isModalOpen && !ModalComponent) {
      import('./components/HeavyModal').then(module => {
        setModalComponent(() => module.default);
      });
    }
  }, [isModalOpen]);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
      {isModalOpen && ModalComponent && <ModalComponent />}
    </>
  );
}
```

### 라이브러리 번들 분리

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 벤더 라이브러리 분리
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          utils: ['date-fns', 'lodash'],
        },
      },
    },
  },
});
```

## 3. 대용량 리스트 최적화

### 가상 스크롤 (react-window)

```typescript
// ❌ 나쁨: 10,000개 아이템을 모두 렌더링
function EventList({ events }) {
  return (
    <div>
      {events.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}

// ✅ 좋음: 화면에 보이는 것만 렌더링
import { FixedSizeList } from 'react-window';

function EventList({ events }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <EventItem event={events[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={events.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 동적 높이 지원

```typescript
import { VariableSizeList } from 'react-window';

function EventList({ events }) {
  const listRef = useRef<VariableSizeList>(null);

  // 각 아이템의 높이 계산
  const getItemSize = (index: number) => {
    const event = events[index];
    return event.description ? 120 : 80; // 설명이 있으면 더 높게
  };

  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={events.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

### 무한 스크롤 + 페이지네이션

```typescript
function InfiniteEventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    const newEvents = await fetchEvents(page);
    setEvents(prev => [...prev, ...newEvents]);
    setPage(prev => prev + 1);
    setHasMore(newEvents.length > 0);
  }, [page]);

  return (
    <InfiniteScroll
      dataLength={events.length}
      next={loadMore}
      hasMore={hasMore}
      loader={<LoadingSpinner />}
    >
      {events.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </InfiniteScroll>
  );
}
```

## 4. 이미지 최적화

### 지연 로딩 (Lazy Loading)

```typescript
// ✅ 이미지가 뷰포트에 들어올 때만 로드
function EventImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy" // 브라우저 네이티브 지연 로딩
    />
  );
}
```

### 반응형 이미지

```typescript
function EventImage({ event }: { event: Event }) {
  return (
    <picture>
      {/* WebP 지원 브라우저 */}
      <source
        srcSet={`${event.image}.webp`}
        type="image/webp"
      />
      {/* 폴백 */}
      <img
        src={`${event.image}.jpg`}
        alt={event.title}
        loading="lazy"
      />
    </picture>
  );
}
```

### Progressive Loading

```typescript
function EventImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* 저화질 플레이스홀더 (blur-up) */}
      <img
        src={`${src}?w=20&q=10`}
        alt={alt}
        style={{
          filter: loaded ? 'none' : 'blur(10px)',
          transition: 'filter 0.3s',
        }}
      />
      {/* 고화질 이미지 */}
      <img
        src={src}
        alt={alt}
        style={{ display: loaded ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
```

## 5. 상태 관리 최적화

### Context 분리

```typescript
// ❌ 나쁨: 하나의 큰 Context
const AppContext = createContext({
  user: null,
  events: [],
  settings: {},
  // ... 많은 상태
});

// ✅ 좋음: 목적별로 분리
const UserContext = createContext(null);
const EventsContext = createContext([]);
const SettingsContext = createContext({});

// 각 Context는 필요한 컴포넌트에만 제공
```

### Context + useMemo

```typescript
function EventsProvider({ children }) {
  const [events, setEvents] = useState<Event[]>([]);

  // Context 값을 메모이제이션
  const value = useMemo(
    () => ({ events, setEvents }),
    [events]
  );

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}
```

## 6. 네트워크 최적화

### 요청 배칭

```typescript
// ❌ 나쁨: 개별 요청
function loadEvents() {
  events.forEach(async event => {
    await updateEvent(event.id);
  });
}

// ✅ 좋음: 배치 요청
function loadEvents() {
  const ids = events.map(e => e.id);
  await updateEvents(ids); // 한 번의 요청
}
```

### 요청 디바운싱

```typescript
// 검색어 입력 시 디바운싱
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        searchEvents(term);
      }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return <input value={searchTerm} onChange={handleChange} />;
}
```

### 캐싱

```typescript
// React Query로 캐싱
import { useQuery } from '@tanstack/react-query';

function EventList() {
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    cacheTime: 10 * 60 * 1000, // 10분간 메모리 유지
  });

  return <div>{/* ... */}</div>;
}
```

## 7. 번들 크기 최적화

### Tree Shaking

```typescript
// ❌ 나쁨: 전체 라이브러리 임포트
import _ from 'lodash';
import * as MUI from '@mui/material';

// ✅ 좋음: 필요한 것만 임포트
import { debounce, throttle } from 'lodash';
import { Button, TextField } from '@mui/material';
```

### Dynamic Import

```typescript
// ✅ 필요할 때만 로드
async function exportToPDF() {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  // PDF 생성...
}
```

## 성능 측정

### React DevTools Profiler

```typescript
// Profiler로 컴포넌트 성능 측정
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponent />
    </Profiler>
  );
}
```

### Performance API

```typescript
// 성능 메트릭 측정
function measurePerformance() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FCP:', entry.startTime);
    }
  });

  observer.observe({ entryTypes: ['paint'] });
}
```

## 체크리스트

### 리렌더링 최적화
- [ ] React.memo 적용 (자주 렌더링되는 컴포넌트)
- [ ] useMemo 적용 (비싼 계산)
- [ ] useCallback 적용 (자식에게 전달되는 함수)

### 코드 스플리팅
- [ ] 라우트 레벨 지연 로딩
- [ ] 무거운 컴포넌트 동적 임포트
- [ ] 라이브러리 번들 분리

### 리스트 최적화
- [ ] 가상 스크롤 적용 (100개 이상 아이템)
- [ ] 무한 스크롤 + 페이지네이션
- [ ] key prop 최적화

### 네트워크 최적화
- [ ] 요청 배칭
- [ ] 디바운싱/쓰로틀링
- [ ] 캐싱 전략

### 번들 최적화
- [ ] Tree shaking 확인
- [ ] 불필요한 의존성 제거
- [ ] 번들 사이즈 분석

---

**성능 최적화는 측정부터! 🚀**

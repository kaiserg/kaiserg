import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section>
        <h1>Poker Planner</h1>
        <p>Planning Poker estimation tool.</p>
        <div>
          <Link href="/session">Open demo session</Link>
        </div>
      </section>
    </main>
  );
}

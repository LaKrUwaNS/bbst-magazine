export default function EventsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center py-12">
      <h1 className="text-3xl font-bold">Upcoming Events</h1>
      <p className="text-gray-600 text-lg">
        Join us for exclusive webinars, meetups, and conferences. 
        We regularly host events featuring industry leaders and our top authors.
      </p>
      <div className="p-8 border border-gray-200 rounded-md bg-gray-50 mt-8">
        <h2 className="text-xl font-semibold mb-2">Stay Tuned!</h2>
        <p className="text-gray-500">
          We are currently planning our next event calendar. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}

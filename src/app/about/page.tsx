export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold border-b border-gray-200 pb-2">About BBST Magazine</h1>
      
      <div className="prose max-w-none text-gray-800 space-y-4">
        <p>
          BBST Magazine is a premier digital publication dedicated to bringing you the most insightful articles,
          exclusive interviews, and the latest trends across technology, design, and innovation.
        </p>
        
        <p>
          Founded in 2027, our mission is to provide high-quality, thought-provoking content that empowers our readers
          to stay ahead of the curve. We believe in the power of knowledge and the importance of continuous learning.
        </p>

        <h2 className="text-2xl font-semibold pt-4">Our Vision</h2>
        <p>
          To be the leading source of inspiration and information for professionals and enthusiasts worldwide,
          fostering a community of forward-thinkers and innovators.
        </p>

        <h2 className="text-2xl font-semibold pt-4">Contact Us</h2>
        <p>
          Have questions, suggestions, or want to contribute? We&apos;d love to hear from you. 
          Reach out to our editorial team at <a href="mailto:contact@bbstmagazine.example.com" className="text-blue-600 hover:underline">contact@bbstmagazine.example.com</a>.
        </p>
      </div>
    </div>
  );
}

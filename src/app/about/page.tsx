export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            About <span className="text-orange-600">BitcoinLatte</span>
          </h1>
          <p className="text-xl text-gray-600 font-semibold">
            Connecting Bitcoin enthusiasts with crypto-friendly coffee shops worldwide
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              BitcoinLatte is dedicated to building a global network of coffee shops that accept Bitcoin and other cryptocurrencies. 
              We believe in empowering the Bitcoin economy by making it easier for people to spend their crypto in everyday life, 
              starting with their daily coffee.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-4xl">💡</span>
              Why BitcoinLatte?
            </h2>
            <div className="space-y-4 text-lg text-gray-700">
              <p>
                <strong className="text-orange-600">Discover:</strong> Find coffee shops near you that accept Bitcoin, Lightning Network, and other cryptocurrencies.
              </p>
              <p>
                <strong className="text-orange-600">Contribute:</strong> Help grow the network by submitting new crypto-friendly locations.
              </p>
              <p>
                <strong className="text-orange-600">Connect:</strong> Join a community of Bitcoin enthusiasts and coffee lovers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-4xl">⚡</span>
              Lightning Network
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We prioritize shops that accept Lightning Network payments for instant, low-fee Bitcoin transactions. 
              Lightning makes it practical to buy a coffee with Bitcoin without waiting for confirmations or paying high fees.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-4xl">🤝</span>
              Get Involved
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Whether you're a coffee shop owner looking to accept Bitcoin, or a customer who knows a great crypto-friendly café, 
              we'd love to hear from you. Together, we can build a more Bitcoin-friendly world, one latte at a time.
            </p>
            <div className="flex gap-4">
              <a
                href="/shops/submit"
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all hover:scale-105 shadow-lg"
              >
                Submit a Shop
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-all hover:scale-105 shadow-lg"
              >
                Browse Map
              </a>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold text-lg transition-colors"
          >
            ← Back to Home
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t-2 border-gray-200 text-center text-sm text-gray-600">
          &copy; 2025{' '}
          <a
            href="https://profullstack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-600 transition-colors font-semibold"
          >
            Profullstack, Inc.
          </a>
          {' '} | {' '}
          <a
            href="https://github.com/profullstack/bitcoinlatte"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-600 transition-colors font-semibold"
          >
            GitHub
          </a>
        </footer>
      </div>
    </div>
  )
}
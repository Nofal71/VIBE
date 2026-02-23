import React from 'react';

const MainLandingPage: React.FC = () => {
    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            {/* Navbar segment */}
            <header className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="text-2xl font-extrabold text-blue-900 tracking-tight">IHSolution.tech</div>
                    <nav className="hidden md:flex space-x-8">
                        <a href="#solutions" className="text-gray-600 hover:text-blue-600 font-medium">Solutions</a>
                        <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
                        <a href="/crm" className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 shadow-md transition">Tenant Login</a>
                    </nav>
                </div>
            </header>

            {/* Hero Box */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 mt-10">
                    The Infinite SaaS <span className="text-blue-600">Enterprise CRM</span>.
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Unlock fully dynamic database structures, granular security maps, industry-specific workflows, and an ultra-scalable Dockerized microservice architecture. Built for scale.
                </p>
                <div className="flex space-x-4">
                    <button onClick={() => window.location.href = '/super-admin/provision'} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-xl transform transition hover:scale-105 text-lg">
                        Start Super Admin Provisioning
                    </button>
                </div>
            </section>

            {/* Industry Solutions Segment */}
            <section id="solutions" className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">Built for Your Industry</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                            Instantly deploy custom database schemas mapped entirely for your specific niche constraints.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Immigration Block */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition duration-300">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Immigration Blueprint</h3>
                            <p className="text-gray-600 mb-6">Light mode themes aligned mapped uniquely over custom Visa tables, mapping automated Welcome funnels safely.</p>
                        </div>

                        {/* Real Estate Block */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition duration-300">
                            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Elite Real Estate Blueprint</h3>
                            <p className="text-gray-600 mb-6">Dark mode architectures. Bound rigidly against dynamic 'Properties' database components wrapping complex pipelines natively.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Module */}
            <section id="pricing" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900">Scalable Microservice Plans</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="border border-gray-200 rounded-2xl p-8 shadow-sm">
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Starter Node</h4>
                            <p className="text-5xl font-extrabold text-gray-900 mb-6">$49<span className="text-xl text-gray-500 font-medium">/mo</span></p>
                            <ul className="space-y-4 mb-8 text-gray-600">
                                <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 500 Dynamic Leads limit</li>
                                <li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 1GB Native Storage</li>
                            </ul>
                            <button className="w-full bg-blue-50 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-100 transition">Get Started</button>
                        </div>

                        <div className="border-2 border-blue-600 rounded-2xl p-8 shadow-xl relative bg-blue-900 text-white transform scale-105">
                            <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">Enterprise Scale</div>
                            <h4 className="text-2xl font-bold mb-2">Pro Cluster</h4>
                            <p className="text-5xl font-extrabold mb-6">$199<span className="text-xl text-blue-300 font-medium">/mo</span></p>
                            <ul className="space-y-4 mb-8 text-blue-100">
                                <li className="flex items-center"><svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 10,000 Global Leads limit</li>
                                <li className="flex items-center"><svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 5GB Deep Storage Metrics</li>
                                <li className="flex items-center"><svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Full State Machine Automation</li>
                            </ul>
                            <button className="w-full bg-white text-blue-900 font-bold py-3 rounded-lg hover:bg-gray-100 transition">Deploy Instance</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 text-center">
                <p className="text-gray-400 mb-2">Developed strictly following rigid Microservice constraints via Express.</p>
                <p className="text-gray-600 text-sm">© 2026 IHSolution.tech. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default MainLandingPage;

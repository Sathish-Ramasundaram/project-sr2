import React from 'react';

function AboutContactSection() {
  return (
    <section className="px-0.5 pb-8 sm:px-1 md:px-2">

        <div className="mx-auto grid max-w-4xl gap-12 text-center text-sm md:grid-cols-2">
          
          <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold">About Us</p>
            <p className="mt-2">
              SR Stores has served neighborhood families for over 20 years with quality groceries, fair pricing, and trusted daily essentials.
            </p>
            <p className="mt-2">
              Branches: Chennai, Coimbatore, Madurai, Tirunelveli 
            </p>
            <p className="mt-2">
              Open: 6:00 AM - 10:00 PM.
            </p>
          </article>

          <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold">Contact Us</p>
            <p className="mt-2">Phone: +91 98765 43210</p>
            <p className="mt-1">Email: support@srstores.demo</p>
          </article>
        </div>

    </section>
  );
}

export default AboutContactSection;

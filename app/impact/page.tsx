import type { Metadata } from "next";
import { heritageIcons } from "@/components/Icons";
import { NoApiNote } from "@/components/NoApiNote";

export const metadata: Metadata = {
  title: "Haor Climate & Livelihood Initiative",
  description: "Deshojo Bazar's community-led Murta, Shital Pati and climate-resilient livelihoods initiative in Tahirpur, Sunamganj, Bangladesh.",
};

const model = [
  ["01", "Grow Murta", "Encourage Murta cultivation across suitable parts of the haor region and strengthen local knowledge on propagation and management."],
  ["02", "Build skills", "Train community members to process Murta and produce Shital Pati and diversified handicrafts with improved quality and design."],
  ["03", "Create value", "Connect craftsmanship with product development, market access and fairer livelihood opportunities rooted in local cultural heritage."],
  ["04", "Strengthen resilience", "Use a locally appropriate wetland plant as part of a broader strategy for erosion resilience, ecosystem health and diversified income."],
];

const outcomes = [
  ["01", "Community production", "Support decentralised household and group-based craft production."],
  ["02", "Heritage skills", "Protect and modernise knowledge around Shital Pati and Murta craftsmanship."],
  ["03", "Market readiness", "Improve design, consistency, presentation and routes to domestic and international buyers."],
  ["04", "Local stewardship", "Create a livelihood incentive for continued Murta cultivation and wetland care."],
];

const funding = [
  ["01", "Murta nurseries & cultivation", "expand planting material, community demonstration plots and locally managed propagation."],
  ["02", "Training & enterprise development", "strengthen artisan skills, product diversification, quality control and business capability."],
  ["03", "Market access", "develop ethical value chains, buyer connections, packaging, storytelling and export readiness."],
  ["04", "Evidence & monitoring", "measure erosion, water-quality, vegetation, fish/bird indicators, livelihoods and adaptation outcomes over time."],
  ["05", "Replication & learning", "document what works and adapt the model for other suitable haor communities."],
];

export default function ImpactPage() {
  return (
    <div className="bg-paper">
      <div className="page-wrap pt-4">
        <NoApiNote />
      </div>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#073f31_0%,#0b5a43_55%,#386e54_100%)] text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,.22)_0_2px,transparent_3px),radial-gradient(circle_at_75%_75%,rgba(233,197,111,.3)_0_2px,transparent_3px)] bg-[length:46px_46px,70px_70px]" />
        <div className="page-wrap relative z-[2] grid items-center gap-8 py-12 sm:gap-10 sm:py-16 lg:min-h-[690px] lg:grid-cols-[1.12fr_0.88fr] lg:gap-[70px] lg:py-[85px]">
          <div>
            <div className="text-[11px] font-extrabold tracking-[1.5px] text-gold uppercase sm:text-[13px] sm:tracking-[2.2px]">
              Community-led climate adaptation • Tahirpur Haor, Bangladesh
            </div>
            <h1 className="mt-2.5 mb-5 max-w-[780px] font-serif text-[clamp(28px,7vw,43px)] leading-[1.08] sm:mb-[22px] sm:text-[clamp(40px,5.8vw,76px)] sm:leading-[1.02]">
              Regenerating haor livelihoods through Murta, craft and wetland resilience.
            </h1>
            <p className="mb-6 max-w-[720px] text-[15px] leading-relaxed text-[#e0ece7] sm:mb-7 sm:text-lg">
              We work with communities in the Tahirpur haor region of Sunamganj to strengthen climate-resilient livelihoods by cultivating Murta, developing Shital Pati and other handicrafts, and building local skills around a plant deeply connected to the wetland landscape.
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <a href="#partnership" className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold">
                Partner with this initiative →
              </a>
              <a href="#model" className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/70 px-6 py-3.5 font-bold hover:bg-white hover:text-green-dark">
                Explore the model
              </a>
            </div>
            <div className="mt-[34px] flex max-w-[480px] items-center gap-[13px] border-t border-white/20 pt-6">
              <span className="grid h-[50px] w-[50px] place-items-center rounded-full bg-[#f3d88b] font-black tracking-wide text-[#173d31]">ARA</span>
              <div>
                <strong className="block">Project support</strong>
                <small className="mt-0.5 block text-[#c9ddd4]">Adaptation Research Alliance (ARA)</small>
              </div>
            </div>
          </div>
          <div className="relative max-w-[620px] rounded-[34px] border border-white/20 bg-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,.2)] backdrop-blur-md sm:p-[34px]">
            <div className="text-[11px] font-black tracking-[2px] text-[#f4cf76]">FIELD PROGRAMME</div>
            <div className="relative mx-auto my-8 flex aspect-square w-[min(250px,90%)] flex-col items-center justify-center rounded-full border border-white/35 sm:w-[290px]">
              <span className="relative z-[2] text-xs tracking-[3px] text-[#f1d88f]">TAHIRPUR</span>
              <b className="relative z-[2] font-serif text-[54px] leading-none">HAOR</b>
              <small className="relative z-[2] text-xs text-[#d8e7df]">Sunamganj • Sylhet Division</small>
            </div>
            <div className="grid gap-[11px]">
              {[
                ["Nature + Livelihoods", "One integrated adaptation pathway"],
                ["Local Skills", "Community craft training and value addition"],
                ["Wetland Resilience", "Murta cultivation in a flash-flood landscape"],
              ].map(([title, text]) => (
                <div key={title} className="border-t border-white/15 py-3">
                  <strong className="block text-sm">{title}</strong>
                  <span className="mt-[3px] block text-xs text-[#c8dad1]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="page-wrap grid items-start gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-[90px]">
          <div>
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">The challenge</div>
            <h2 className="mt-2 font-serif text-[clamp(35px,4vw,54px)] leading-[1.08] text-green-dark">A livelihood landscape shaped by water</h2>
          </div>
          <div className="text-[17px] leading-loose text-[#4e5c54] [&_strong]:text-green-dark">
            <p className="mb-[18px]">The haor ecosystem of north-eastern Bangladesh is both productive and highly exposed to seasonal water dynamics. In Tahirpur, recurrent flash floods can damage land, disrupt livelihoods and accelerate erosion at the edges of homesteads and productive areas.</p>
            <p>Our response starts with a local resource rather than an imported solution: <strong>Murta (<em>Schumannianthus dichotomus</em>)</strong>, the traditional raw material used to make Shital Pati and other woven products. By linking cultivation, skills and market access, we aim to create an adaptation model that communities can own, maintain and benefit from over time.</p>
          </div>
        </div>
      </section>

      <section id="model" className="bg-[#edf1e7] py-8 sm:py-12">
        <div className="page-wrap">
          <div className="mb-6">
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Our adaptation model</div>
            <h2 className="mt-2 font-serif text-[clamp(32px,4vw,50px)] leading-[1.1] text-green-dark">From wetland plant to resilient local economy</h2>
            <p className="mt-3 max-w-[560px] text-muted">The programme combines ecosystem stewardship with practical livelihood development, so environmental resilience and household opportunity reinforce each other.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {model.map(([n, title, text], index) => {
              const Icon = heritageIcons[index % heritageIcons.length];
              return (
              <article key={n} className="relative min-h-[260px] rounded-3xl border border-[#d9dfd1] bg-[#fffdf8] p-[26px] sm:min-h-[315px]">
                <span className="absolute top-[19px] right-5 text-[11px] font-black text-[#a3ada5]">{n}</span>
                <div className="mb-[52px] grid h-14 w-14 place-items-center rounded-full bg-green-dark text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-[11px] font-serif text-[25px] text-green-dark">{title}</h3>
                <p className="m-0 text-sm leading-relaxed text-muted">{text}</p>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0a3e31] py-8 text-white sm:py-12">
        <div className="page-wrap grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-[65px]">
          <div>
            <div className="text-xs font-extrabold tracking-[2px] text-gold uppercase">Why Murta matters</div>
            <h2 className="mt-2 mb-5 font-serif text-[clamp(35px,4vw,53px)] leading-[1.08] text-white">One plant. Multiple adaptation benefits.</h2>
            <p className="mb-4 leading-relaxed text-[#cee0d8]">Research from the Sylhet region has documented Murta as an important wetland-based raw material and has associated its cultivation with reduced flood and soil-erosion risk. Separate research has also examined Murta’s potential for contaminant removal in constructed wetland systems.</p>
            <p className="leading-relaxed text-[#cee0d8]">In our field model, these environmental functions are combined with craft-based livelihoods. We treat improved water conditions, fish habitat and bird abundance as <strong className="text-white">ecological co-benefits to be monitored and evidenced</strong>, rather than overstating causality before field measurements are complete.</p>
            <div className="mt-[26px] flex flex-wrap gap-2">
              {["Soil & bank stability", "Wetland vegetation", "Livelihood diversification", "Traditional knowledge", "Water-quality potential", "Biodiversity monitoring"].map((chip) => (
                <span key={chip} className="rounded-full border border-white/20 bg-white/10 px-[11px] py-2 text-[11px] font-semibold text-[#e5f0eb]">{chip}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-[#f8f1df] p-[18px] text-ink sm:p-7" aria-label="Adaptation pathway diagram">
            <Node tone="a" title="Murta cultivation" text="Local wetland resource" />
            <div className="text-center text-[22px] leading-snug text-orange">↓</div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Node title="Rhizomes & vegetation" text="Potential erosion-resilience function" />
              <Node title="Harvestable stems" text="Renewable craft material" />
            </div>
            <div className="text-center text-[22px] leading-snug text-orange">↓</div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Node title="Wetland co-benefits" text="Water, habitat & biodiversity indicators" />
              <Node title="Skills + products" text="Shital Pati & handicrafts" />
            </div>
            <div className="text-center text-[22px] leading-snug text-orange">↓</div>
            <Node tone="final" title="More resilient communities" text="Local income + stewardship + adaptation capacity" />
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-12">
        <div className="page-wrap">
          <div className="mb-[42px] grid items-start gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-[90px]">
            <div>
              <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Community capability</div>
              <h2 className="mt-2 font-serif text-[clamp(35px,4vw,54px)] leading-[1.08] text-green-dark">Skills are the infrastructure that stays.</h2>
            </div>
            <p className="text-[17px] leading-loose text-[#4e5c54]">We do not see communities only as beneficiaries. They are producers, knowledge holders, makers and adaptation partners. Training is designed to strengthen practical production capability from selecting and preparing Murta to weaving, finishing, quality improvement and developing new handicraft formats that can reach broader markets.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-[#dde3da] bg-[#dde3da] sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map(([n, title, text]) => (
              <div key={n} className="min-h-[250px] bg-[#f8f7ef] p-7">
                <strong className="text-[11px] tracking-[1px] text-orange">{n}</strong>
                <h3 className="mt-[46px] mb-2.5 font-serif text-[22px] text-green-dark">{title}</h3>
                <p className="m-0 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="partnership" className="bg-[#f0e6ce] py-8 sm:py-12">
        <div className="page-wrap grid gap-8 rounded-[30px] border border-[#ded3b9] bg-[#fffdf8] p-[27px] sm:p-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-[62px]">
          <div>
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Partnership & investment opportunity</div>
            <h2 className="mt-2 mb-[18px] font-serif text-[clamp(34px,4vw,50px)] leading-[1.1] text-green-dark">Help us turn a locally rooted practice into a scalable adaptation model.</h2>
            <p className="mb-6 leading-relaxed text-muted">We are seeking mission-aligned partners, research collaborators and funders who want to support locally led climate adaptation with measurable livelihood and ecosystem outcomes in the Bangladesh haor region.</p>
            <a href="mailto:info@deshojobazar.com?subject=Partnership%20Inquiry%20-%20Tahirpur%20Haor%20Initiative" className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white">
              Discuss a partnership →
            </a>
          </div>
          <div>
            {funding.map(([n, title, text]) => (
              <div key={n} className="grid grid-cols-[38px_1fr] gap-3.5 border-b border-[#e7e0d2] py-[17px] last:border-b-0">
                <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#e6eee5] text-[10px] font-black text-green-dark">{n}</span>
                <p className="m-0 text-sm leading-snug text-[#56625a]"><strong className="text-green-dark">{title}</strong> {text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-12">
        <div className="page-wrap grid max-w-[950px] items-center gap-8 lg:grid-cols-[220px_1fr] lg:gap-[55px]">
          <div className="grid aspect-square w-[120px] place-items-center rounded-full bg-green-dark font-serif text-[40px] font-extrabold text-[#f0cf7a] shadow-[0_0_0_14px_#e9eee6,0_0_0_15px_#d6ddd2] sm:w-[190px] sm:text-[58px]">ARA</div>
          <div>
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Early project support</div>
            <h2 className="mt-[7px] mb-[15px] font-serif text-[clamp(32px,4vw,47px)] text-green-dark">Supported by the Adaptation Research Alliance</h2>
            <p className="max-w-[700px] leading-relaxed text-muted">This initiative has received support from the <strong>Adaptation Research Alliance (ARA)</strong>. ARA is a global coalition focused on action-oriented adaptation research that responds to the knowledge needs of climate-vulnerable communities, particularly in the Global South.</p>
            <a href="https://adaptationresearchalliance.org/" target="_blank" rel="noopener" className="font-bold text-green hover:text-orange">Learn about ARA →</a>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f1e5] py-8 sm:py-12">
        <div className="page-wrap">
          <div className="mb-6">
            <div className="text-xs font-extrabold tracking-[2px] text-orange uppercase">Evidence-informed approach</div>
            <h2 className="mt-2 font-serif text-[clamp(32px,4vw,50px)] leading-[1.1] text-green-dark">Grounded in local knowledge, strengthened by research</h2>
          </div>
          <div className="grid gap-[17px] sm:grid-cols-2 lg:grid-cols-3">
            <Evidence href="https://en.banglapedia.org/index.php/Murta" kicker="Reference" title="Murta in Bangladesh" text="Banglapedia documents Murta as the traditional raw material for Shital Pati and describes its wetland distribution and uses." label="Open source →" />
            <Evidence href="https://doi.org/10.1016/j.envc.2022.100631" kicker="Peer-reviewed research" title="Phytoremediation potential" text="A 2022 study investigated Schumannianthus dichotomus for contaminant removal in a constructed wetland system." label="View research →" />
            <Evidence href="https://adaptationresearchalliance.org/knowledge-base/adaptation-research-alliance-ara/adaptation-research-for-impact-principles/" kicker="Adaptation practice" title="Research for impact" text="ARA’s principles emphasise demand-driven, action-oriented research that strengthens climate adaptation and resilience." label="View principles →" />
          </div>
          <p className="mt-[22px] max-w-[900px] border-l-[3px] border-[#d8c78f] pl-3.5 text-xs leading-relaxed text-[#7a807b]">
            Environmental outcomes on this page are presented as an adaptation pathway and evidence agenda. Site-specific impacts should be validated through baseline data and continued monitoring as the programme scales.
          </p>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#ed7148,#cf5c37)] py-10 text-white sm:py-14">
        <div className="page-wrap max-w-[850px] text-center">
          <span className="text-[11px] font-black tracking-[2px] text-[#ffe2c9]">DESHOJO • TAHIRPUR HAOR</span>
          <h2 className="mt-2.5 mb-[15px] font-serif text-[38px] leading-[1.08] text-white sm:text-[clamp(36px,5vw,58px)]">Local material. Local knowledge. Long-term resilience.</h2>
          <p className="mb-[25px] text-[17px] text-[#fff2e9]">We welcome partners who want to build climate adaptation with communities not only for them.</p>
          <a href="mailto:info@deshojobazar.com?subject=Haor%20Climate%20Adaptation%20Partnership" className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/70 px-6 py-3.5 font-bold hover:bg-white hover:text-green-dark">
            info@deshojobazar.com
          </a>
        </div>
      </section>
    </div>
  );
}

function Node({ title, text, tone }: { title: string; text: string; tone?: "a" | "final" }) {
  const toneClass = tone === "a" ? "bg-[#e5ede3]" : tone === "final" ? "bg-[#f1cf82]" : "bg-white";
  return (
    <div className={`rounded-2xl border border-[#ded6c4] px-4 py-3.5 text-center ${toneClass}`}>
      <b className="block text-sm text-green-dark">{title}</b>
      <small className="mt-[3px] block text-[11px] text-muted">{text}</small>
    </div>
  );
}

function Evidence({ href, kicker, title, text, label }: { href: string; kicker: string; title: string; text: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className="flex min-h-[250px] flex-col rounded-[22px] border border-[#e2dac8] bg-white p-[25px] transition hover:-translate-y-1 hover:shadow-lift">
      <small className="font-extrabold tracking-[1px] text-orange uppercase">{kicker}</small>
      <h3 className="my-2 font-serif text-[23px] text-green-dark">{title}</h3>
      <p className="mb-[18px] text-sm leading-relaxed text-muted">{text}</p>
      <span className="mt-auto text-[13px] font-extrabold text-green">{label}</span>
    </a>
  );
}

import React, { useState } from 'react';
import { Chart, Placement } from '../types';
import { LayoutGrid, Layers, Table as TableIcon, Info } from 'lucide-react';

interface KundliVisualizerProps {
  chart: Chart;
}

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_NUMBERS: Record<string, number> = {
  'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
  'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
  'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12,
  'Mesha': 1, 'Vrishabha': 2, 'Mithuna': 3, 'Karka': 4,
  'Simha': 5, 'Kanya': 6, 'Tula': 7, 'Vrishchika': 8,
  'Dhanu': 9, 'Makara': 10, 'Kumbha': 11, 'Meena': 12,
};

export const KundliVisualizer: React.FC<KundliVisualizerProps> = ({ chart }) => {
  const [viewStyle, setViewStyle] = useState<'north' | 'south' | 'table'>('north');

  // Map planets by house (1 to 12)
  const housePlacements: Record<number, Placement[]> = {};
  for (let h = 1; h <= 12; h++) {
    housePlacements[h] = [];
  }
  chart.placements.forEach((p) => {
    if (p.house >= 1 && p.house <= 12) {
      housePlacements[p.house].push(p);
    }
  });

  // Calculate sign number for each house based on Lagna
  const lagnaSignName = chart.ascendant_sign || 'Aries';
  const lagnaSignNum = SIGN_NUMBERS[lagnaSignName] || 1;

  const getSignForHouse = (houseNum: number): number => {
    // House 1 is lagnaSignNum, House 2 is lagnaSignNum + 1, etc.
    return ((lagnaSignNum - 1 + (houseNum - 1)) % 12) + 1;
  };

  const renderPlanetChip = (p: Placement) => (
    <span
      key={p.planet}
      className={`inline-flex items-center text-[10px] font-semibold px-1 py-0.5 rounded mr-1 mb-0.5 ${
        p.is_retrograde
          ? 'bg-amber-100 text-amber-900 border border-amber-300'
          : p.is_combust
          ? 'bg-rose-100 text-rose-900 border border-rose-300'
          : 'bg-ivory-200 text-vedic-950 border border-ivory-300'
      }`}
      title={`${p.planet} in ${p.sign} (${p.degree ? `${p.degree}°` : ''}) ${p.is_retrograde ? '[Retrograde]' : ''}`}
    >
      {p.planet.slice(0, 2)}
      {p.is_retrograde && <span className="text-[8px] font-bold text-amber-700 ml-0.5">R</span>}
      {p.is_combust && <span className="text-[8px] font-bold text-rose-700 ml-0.5">C</span>}
    </span>
  );

  return (
    <div className="bg-ivory-50 rounded-2xl p-5 border border-ivory-300 shadow-vedic">
      {/* Header & Style Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-200 gap-3">
        <div>
          <h3 className="font-vedic font-bold text-lg text-vedic-900 flex items-center space-x-2">
            <span>{chart.title || 'Kundli Chart'}</span>
            <span className="text-xs font-sans font-normal px-2 py-0.5 rounded-full bg-gold-400/20 text-vedic-800 border border-gold-500/30">
              Lagna: {chart.ascendant_sign || 'Aries'} {chart.ascendant_degree ? `(${chart.ascendant_degree}°)` : ''}
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Format: {chart.chart_type === 'south_indian' ? 'South Indian' : 'North Indian'} • Verified Placements: {chart.placements.length}
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center space-x-1 bg-ivory-200 p-1 rounded-xl self-start sm:self-auto border border-ivory-300">
          <button
            onClick={() => setViewStyle('north')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewStyle === 'north' ? 'bg-vedic-800 text-ivory-50 shadow-sm' : 'text-stone-700 hover:text-vedic-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>North Diamond</span>
          </button>
          <button
            onClick={() => setViewStyle('south')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewStyle === 'south' ? 'bg-vedic-800 text-ivory-50 shadow-sm' : 'text-stone-700 hover:text-vedic-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>South Grid</span>
          </button>
          <button
            onClick={() => setViewStyle('table')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewStyle === 'table' ? 'bg-vedic-800 text-ivory-50 shadow-sm' : 'text-stone-700 hover:text-vedic-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Planetary Table</span>
          </button>
        </div>
      </div>

      {/* View Display Area */}
      <div className="py-5 flex items-center justify-center">
        {viewStyle === 'north' && (
          <div className="w-full max-w-[420px] aspect-square relative bg-ivory-100 rounded-xl border-2 border-gold-600/40 p-2 shadow-inner">
            <svg viewBox="0 0 400 400" className="w-full h-full text-vedic-900">
              {/* Outer boundary */}
              <rect x="10" y="10" width="380" height="380" fill="none" stroke="#C5A059" strokeWidth="2.5" />
              {/* Main diagonals */}
              <line x1="10" y1="10" x2="390" y2="390" stroke="#C5A059" strokeWidth="2" />
              <line x1="10" y1="390" x2="390" y2="10" stroke="#C5A059" strokeWidth="2" />
              {/* Inner Diamond (connects midpoints) */}
              <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="#C5A059" strokeWidth="2" />
            </svg>

            {/* House Content Overlays (Fixed North Indian Houses) */}
            {/* House 1 (Top Center Diamond) */}
            <div className="absolute top-[16%] left-[32%] w-[36%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-gold-700">1 (Lagna) - Sign {getSignForHouse(1)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[1].map(renderPlanetChip)}</div>
            </div>

            {/* House 2 (Top Left Triangle) */}
            <div className="absolute top-[6%] left-[12%] w-[25%] h-[15%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">2 • S{getSignForHouse(2)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[2].map(renderPlanetChip)}</div>
            </div>

            {/* House 3 (Left Upper Triangle) */}
            <div className="absolute top-[22%] left-[4%] w-[22%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">3 • S{getSignForHouse(3)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[3].map(renderPlanetChip)}</div>
            </div>

            {/* House 4 (Left Center Diamond) */}
            <div className="absolute top-[40%] left-[12%] w-[25%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-gold-700">4 • S{getSignForHouse(4)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[4].map(renderPlanetChip)}</div>
            </div>

            {/* House 5 (Left Lower Triangle) */}
            <div className="absolute top-[60%] left-[4%] w-[22%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">5 • S{getSignForHouse(5)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[5].map(renderPlanetChip)}</div>
            </div>

            {/* House 6 (Bottom Left Triangle) */}
            <div className="absolute bottom-[6%] left-[12%] w-[25%] h-[15%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">6 • S{getSignForHouse(6)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[6].map(renderPlanetChip)}</div>
            </div>

            {/* House 7 (Bottom Center Diamond) */}
            <div className="absolute bottom-[16%] left-[32%] w-[36%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-gold-700">7 • Sign {getSignForHouse(7)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[7].map(renderPlanetChip)}</div>
            </div>

            {/* House 8 (Bottom Right Triangle) */}
            <div className="absolute bottom-[6%] right-[12%] w-[25%] h-[15%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">8 • S{getSignForHouse(8)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[8].map(renderPlanetChip)}</div>
            </div>

            {/* House 9 (Right Lower Triangle) */}
            <div className="absolute top-[60%] right-[4%] w-[22%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">9 • S{getSignForHouse(9)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[9].map(renderPlanetChip)}</div>
            </div>

            {/* House 10 (Right Center Diamond) */}
            <div className="absolute top-[40%] right-[12%] w-[25%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-gold-700">10 • S{getSignForHouse(10)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[10].map(renderPlanetChip)}</div>
            </div>

            {/* House 11 (Right Upper Triangle) */}
            <div className="absolute top-[22%] right-[4%] w-[22%] h-[20%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">11 • S{getSignForHouse(11)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[11].map(renderPlanetChip)}</div>
            </div>

            {/* House 12 (Top Right Triangle) */}
            <div className="absolute top-[6%] right-[12%] w-[25%] h-[15%] flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-stone-500">12 • S{getSignForHouse(12)}</span>
              <div className="flex flex-wrap justify-center mt-0.5">{housePlacements[12].map(renderPlanetChip)}</div>
            </div>
          </div>
        )}

        {viewStyle === 'south' && (
          <div className="w-full max-w-[420px] aspect-square grid grid-cols-4 grid-rows-4 gap-1 p-2 bg-ivory-200 rounded-xl border-2 border-gold-600/40 shadow-inner">
            {/* South Indian 12 Signs perimeter boxes with hollow center */}
            {/* Rashi index mapping in South Indian:
                Row 1: Pisces(12), Aries(1), Taurus(2), Gemini(3)
                Row 2: Aquarius(11), [Center], [Center], Cancer(4)
                Row 3: Capricorn(10), [Center], [Center], Leo(5)
                Row 4: Sagittarius(9), Scorpio(8), Libra(7), Virgo(6)
            */}
            {[
              { sign: 'Pisces', signNum: 12, pos: 'col-start-1 row-start-1' },
              { sign: 'Aries', signNum: 1, pos: 'col-start-2 row-start-1' },
              { sign: 'Taurus', signNum: 2, pos: 'col-start-3 row-start-1' },
              { sign: 'Gemini', signNum: 3, pos: 'col-start-4 row-start-1' },
              { sign: 'Aquarius', signNum: 11, pos: 'col-start-1 row-start-2' },
              { sign: 'Cancer', signNum: 4, pos: 'col-start-4 row-start-2' },
              { sign: 'Capricorn', signNum: 10, pos: 'col-start-1 row-start-3' },
              { sign: 'Leo', signNum: 5, pos: 'col-start-4 row-start-3' },
              { sign: 'Sagittarius', signNum: 9, pos: 'col-start-1 row-start-4' },
              { sign: 'Scorpio', signNum: 8, pos: 'col-start-2 row-start-4' },
              { sign: 'Libra', signNum: 7, pos: 'col-start-3 row-start-4' },
              { sign: 'Virgo', signNum: 6, pos: 'col-start-4 row-start-4' },
            ].map(({ sign, signNum, pos }) => {
              const isLagna = signNum === lagnaSignNum;
              const planetsInSign = chart.placements.filter(
                (p) => p.sign.toLowerCase() === sign.toLowerCase()
              );

              return (
                <div
                  key={sign}
                  className={`${pos} bg-ivory-50 border border-gold-600/30 rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-stone-600">{sign.slice(0, 3)}</span>
                    {isLagna && (
                      <span className="bg-vedic-800 text-gold-300 font-bold px-1 rounded text-[9px]">
                        Lagna
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap mt-1">
                    {planetsInSign.map(renderPlanetChip)}
                  </div>
                </div>
              );
            })}

            {/* Center Area */}
            <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-ivory-100/70 border border-dashed border-ivory-400 rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <span className="font-vedic font-bold text-sm text-vedic-900">VedViki Kundli</span>
              <span className="text-[11px] text-stone-500 mt-0.5">South Indian Fixed Sign Grid</span>
              <span className="text-[10px] text-gold-700 mt-1 font-medium">Clockwise Signs</span>
            </div>
          </div>
        )}

        {viewStyle === 'table' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-ivory-200 text-vedic-900 uppercase font-semibold text-[10px] border-b border-ivory-300">
                <tr>
                  <th className="py-2.5 px-3">Graha (Planet)</th>
                  <th className="py-2.5 px-3">Rashi (Sign)</th>
                  <th className="py-2.5 px-3">Bhava (House)</th>
                  <th className="py-2.5 px-3">Degree</th>
                  <th className="py-2.5 px-3">Nakshatra</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {chart.placements.map((p) => (
                  <tr key={p.planet} className="hover:bg-ivory-200/50 transition-colors">
                    <td className="py-2 px-3 font-semibold text-vedic-900">{p.planet}</td>
                    <td className="py-2 px-3">{p.sign}</td>
                    <td className="py-2 px-3">House {p.house}</td>
                    <td className="py-2 px-3">{p.degree !== null && p.degree !== undefined ? `${p.degree}°` : '—'}</td>
                    <td className="py-2 px-3">
                      {p.nakshatra ? `${p.nakshatra} ${p.nakshatra_pada ? `(Pada ${p.nakshatra_pada})` : ''}` : '—'}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-1">
                        {p.is_retrograde && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold border border-amber-300">
                            Vakri (R)
                          </span>
                        )}
                        {p.is_combust && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 text-[10px] font-semibold border border-rose-300">
                            Asta (C)
                          </span>
                        )}
                        {!p.is_retrograde && !p.is_combust && (
                          <span className="text-stone-400 text-[11px]">Direct</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend footer */}
      <div className="pt-3 border-t border-ivory-200 flex flex-wrap items-center justify-between text-[11px] text-stone-500 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>(R) = Vakri / Retrograde</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>(C) = Asta / Combust</span>
          </span>
        </div>
        <div className="flex items-center space-x-1 text-gold-700">
          <Info className="w-3.5 h-3.5" />
          <span>Calculated with Lahiri (Chitrapaksha) Ayanamsha</span>
        </div>
      </div>
    </div>
  );
};

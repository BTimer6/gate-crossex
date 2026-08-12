import { useLanguage } from './i18n.js';
import {
  adlRiskTone,
  crossExAdlLightLevel,
  exchangeAdlLightLevel,
  type AdlRankDisplay,
} from './adl-ranking.js';

function LightSet({ label, level }: { label: string; level: number | null }) {
  return <span className={`adl-light-set ${adlRiskTone(level)}`}>
    <b>{label}</b>
    <span className="adl-lights" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((light) => <i className={level !== null && light <= level ? 'lit' : ''} key={light} />)}
    </span>
  </span>;
}

export function AdlIndicators({ ranks }: { ranks: readonly AdlRankDisplay[] }) {
  const { t } = useLanguage();
  if (ranks.length === 0) return <span className="adl-unavailable">—</span>;
  return <div className="adl-indicators">
    {ranks.map((rank) => {
      const exchangeLevel = exchangeAdlLightLevel(rank.venue, rank.exchangeRank);
      const crossExLevel = crossExAdlLightLevel(rank.crossExRank);
      const exchangeText = exchangeLevel === null
        ? t('unavailable')
        : `${exchangeLevel}/5 (${t('raw rank')} ${rank.exchangeRank})`;
      const crossExText = crossExLevel === null ? t('unavailable') : `${crossExLevel}/5`;
      const description = `${rank.venue} · ${t('Exchange ADL')}: ${exchangeText} · ${t('CrossEx ADL')}: ${crossExText}`;
      return <span className="adl-rank-row" key={rank.key} title={description} aria-label={description}>
        {ranks.length > 1 && <small>{rank.venue.slice(0, 3)}</small>}
        <LightSet label="EX" level={exchangeLevel} />
        <LightSet label="CX" level={crossExLevel} />
      </span>;
    })}
  </div>;
}

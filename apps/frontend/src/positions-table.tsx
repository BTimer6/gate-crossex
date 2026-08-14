import { Fragment, useEffect, useMemo, useState } from 'react';
import { AdlIndicators } from './adl-indicator.js';
import { ExecutionPagination } from './execution-pagination-control.js';
import { executionPageWindow } from './execution-pagination.js';
import { useLanguage } from './i18n.js';
import { marketSymbol } from './market-symbol.js';
import { compactPrice } from './number-format.js';
import { formatAmount, signedAmount, VenueCell, exchanges } from './route-shared.js';
import { groupPositionRows, type PositionTableRow } from './strategy-positions.js';

interface PositionsTableProps {
  rows: readonly PositionTableRow[];
  onClose: (rows: PositionTableRow[]) => void;
}

function VenueFromCode({ code }: { code: string }) {
  const exchange = exchanges.find((item) => item.id === code.toLowerCase());
  return <VenueCell id={code.toLowerCase()} name={exchange?.name ?? code} short={exchange?.short ?? code.slice(0, 2)} />;
}

function pnlText(value: number, quote: string): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} ${quote}`;
}

function optionalAmount(value: number | null, quote: string): string {
  return value === null ? '—' : `${signedAmount(value)} ${quote}`;
}

function realizedAmount(value: number | null, quote: string): string {
  return value === null ? '—' : `${value.toFixed(2)} ${quote}`;
}

function amountTone(value: number | null): string {
  return value !== null && value > 0 ? 'positive' : value !== null && value < 0 ? 'negative' : '';
}

/** The canonical position table shared by Trade, Strategies, and Portfolio. */
export function PositionsTable({ rows, onClose }: PositionsTableProps) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const groups = useMemo(() => groupPositionRows(rows), [rows]);
  const window = executionPageWindow(groups.length, page);

  useEffect(() => {
    setPage((current) => executionPageWindow(groups.length, current).page);
  }, [groups.length]);

  return <>
    <div className="positions-table table-wrap"><table>
      <thead><tr><th>{t('Contract')}</th><th>{t('Exchange')}</th><th>{t('Size')}</th><th>{t('Position notional')}</th><th>{t('Entry price')}</th><th>{t('Mark price')}</th><th>{t('ADL indicator')}</th><th>{t('Unrealized PnL')}</th><th>{t('Realized PnL')}</th><th>{t('Funding fee')}</th><th>{t('Close position')}</th></tr></thead>
      <tbody>{groups.slice(window.start, window.end).map((group) => {
        if (group.legs.length === 1) {
          const position = group.legs[0];
          const ranks = [{ key: position.id, venue: position.venue, crossExRank: position.crossExAdlRank, exchangeRank: position.exchangeAdlRank }];
          return <tr key={group.key}>
            <td><strong>{marketSymbol(position.asset, position.quote, 'perpetual')}</strong><small className={position.quantity >= 0 ? 'long-tag' : 'short-tag'}>{t(position.quantity >= 0 ? 'Long' : 'Short')}</small></td>
            <td><VenueFromCode code={position.venue} /></td>
            <td>{position.quantity.toFixed(4)} {position.asset}</td>
            <td>{formatAmount(position.value)} {position.quote}</td>
            <td>{compactPrice(position.entryPrice)}</td>
            <td>{compactPrice(position.markPrice)}</td>
            <td><AdlIndicators ranks={ranks} /></td>
            <td className={position.unrealizedPnl >= 0 ? 'positive' : 'negative'}>{pnlText(position.unrealizedPnl, position.quote)}</td>
            <td>{realizedAmount(position.realizedPnl, position.quote)}</td>
            <td className={amountTone(position.fundingFee)}>{optionalAmount(position.fundingFee, position.quote)}</td>
            <td><button className="row-action close-position-action" onClick={() => onClose([position])}>{t('Close position')}</button></td>
          </tr>;
        }

        const expanded = expandedPosition === group.key;
        const aggregateQuote = group.legs.every((position) => position.quote === group.legs[0].quote) ? group.legs[0].quote : 'USDT';
        const realizedValues = group.legs.map((position) => position.realizedPnl).filter((value): value is number => value !== null);
        const fundingValues = group.legs.map((position) => position.fundingFee).filter((value): value is number => value !== null);
        const realizedPnl = realizedValues.length > 0 ? realizedValues.reduce((sum, value) => sum + value, 0) : null;
        const fundingFee = fundingValues.length > 0 ? fundingValues.reduce((sum, value) => sum + value, 0) : null;
        return <Fragment key={group.key}>
          <tr className="aggregate-row">
            <td><button type="button" className={expanded ? 'expand-position expanded' : 'expand-position'} aria-expanded={expanded} aria-label={`${t('Positions')} · ${group.label}`} onClick={() => setExpandedPosition(expanded ? null : group.key)}>›</button><strong>{group.label} PERP</strong><small className={group.fullyHedged ? 'hedged-tag' : group.quantity >= 0 ? 'long-tag' : 'short-tag'}>{t(group.fullyHedged ? 'Hedged' : group.quantity >= 0 ? 'Long' : 'Short')}</small></td>
            <td><span className="venue-group"><strong>{group.venueCount} {t(group.venueCount === 1 ? 'exchange' : 'exchanges')}</strong></span></td>
            <td>{group.mixedAssets ? '—' : `${group.quantity.toFixed(4)} ${group.asset}`}</td>
            <td>${formatAmount(group.grossNotional)}</td>
            <td>{group.mixedAssets ? '—' : compactPrice(group.weightedEntryPrice)}</td>
            <td>{group.mixedAssets ? '—' : compactPrice(group.weightedMarkPrice)}</td>
            <td>—</td>
            <td className={group.unrealizedPnl >= 0 ? 'positive' : 'negative'}>{pnlText(group.unrealizedPnl, aggregateQuote)}</td>
            <td>{realizedAmount(realizedPnl, aggregateQuote)}</td>
            <td className={amountTone(fundingFee)}>{optionalAmount(fundingFee, aggregateQuote)}</td>
            <td><button className="row-action close-position-action" onClick={() => onClose(group.legs)}>{t('Close all')}</button></td>
          </tr>
          {expanded && group.legs.map((position) => <tr className="position-leg" key={position.id}>
            <td><span className="leg-branch">↳</span><strong>{marketSymbol(position.asset, position.quote, 'perpetual')}</strong><small>{t('Venue leg')}</small></td>
            <td><VenueFromCode code={position.venue} /></td>
            <td>{position.quantity.toFixed(4)} {position.asset}</td>
            <td>{formatAmount(position.value)} {position.quote}</td>
            <td>{compactPrice(position.entryPrice)}</td>
            <td>{compactPrice(position.markPrice)}</td>
            <td><AdlIndicators ranks={[{ key: position.id, venue: position.venue, crossExRank: position.crossExAdlRank, exchangeRank: position.exchangeAdlRank }]} /></td>
            <td className={position.unrealizedPnl >= 0 ? 'positive' : 'negative'}>{pnlText(position.unrealizedPnl, position.quote)}</td>
            <td>{realizedAmount(position.realizedPnl, position.quote)}</td>
            <td className={amountTone(position.fundingFee)}>{optionalAmount(position.fundingFee, position.quote)}</td>
            <td><button className="row-action close-position-action" onClick={() => onClose([position])}>{t('Close position')}</button></td>
          </tr>)}
        </Fragment>;
      })}</tbody>
    </table></div>
    <ExecutionPagination itemCount={groups.length} page={window.page} onPageChange={setPage} />
  </>;
}

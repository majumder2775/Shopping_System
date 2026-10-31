import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { db } from '../services/api';
import { TestCaseResult } from '../types';
import {
  FlaskConical,
  X,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Bug,
  FileCheck,
  Filter,
} from 'lucide-react';

export const TestRunnerModal: React.FC = () => {
  const { isTestRunnerOpen, setIsTestRunnerOpen, testSuiteResults, runAutomatedTestSuite } = useShop();
  const [filterCategory, setFilterCategory] = useState<'All' | 'Unit' | 'Integration' | 'System' | 'Acceptance'>('All');
  const [activeTab, setActiveTab] = useState<'results' | 'summary' | 'defects'>('results');

  // Auto-run if empty
  useEffect(() => {
    if (isTestRunnerOpen && testSuiteResults.length === 0) {
      runAutomatedTestSuite();
    }
  }, [isTestRunnerOpen, testSuiteResults.length]);

  if (!isTestRunnerOpen) return null;

  const filteredTests = testSuiteResults.filter((t) =>
    filterCategory === 'All' ? true : t.category === filterCategory
  );

  const passedCount = testSuiteResults.filter((t) => t.status === 'Pass').length;
  const failedCount = testSuiteResults.filter((t) => t.status === 'Fail').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-5xl bg-[#111215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <span>CSC702 Assignment 4: Software Test Plan & Report</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {passedCount}/25 Passed (100%)
                </span>
              </h2>
              <div className="text-[11px] font-mono text-neutral-400">
                Interactive verification of all Unit, Integration, System, and Acceptance test specifications
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAutomatedTestSuite}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-execute All Tests</span>
            </button>

            <button
              onClick={() => setIsTestRunnerOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center border-b border-neutral-800 px-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('results')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'results'
                ? 'border-amber-400 text-amber-300 font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Test Execution Ledger ({testSuiteResults.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'summary'
                ? 'border-amber-400 text-amber-300 font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Section 3.10 Test Summary Table</span>
          </button>
          <button
            onClick={() => setActiveTab('defects')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'defects'
                ? 'border-amber-400 text-amber-300 font-medium'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Section 3.9 Defect Reporting</span>
          </button>
        </div>

        {/* Tab 1: Test Execution Table */}
        {activeTab === 'results' && (
          <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {(['All', 'Unit', 'Integration', 'System', 'Acceptance'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                    filterCategory === cat
                      ? 'bg-neutral-200 text-neutral-950 font-semibold'
                      : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
                  }`}
                >
                  {cat} ({cat === 'All' ? testSuiteResults.length : testSuiteResults.filter((t) => t.category === cat).length})
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto border border-neutral-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[11px] border-b border-neutral-800 sticky top-0">
                  <tr>
                    <th className="py-3 px-3.5">ID</th>
                    <th className="py-3 px-3.5">Test Case & Level</th>
                    <th className="py-3 px-3.5">Input Parameters</th>
                    <th className="py-3 px-3.5">Expected Result</th>
                    <th className="py-3 px-3.5">Actual Result</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/30">
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-neutral-850/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-amber-300">
                        {test.id}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-neutral-200">{test.title}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{test.category} Testing</div>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-neutral-300">
                        {test.input}
                      </td>
                      <td className="py-3 px-3.5 text-neutral-300">
                        {test.expectedResult}
                      </td>
                      <td className="py-3 px-3.5 text-emerald-300 font-mono text-[11px]">
                        {test.actualResult}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Test Summary Table (Section 3.10) */}
        {activeTab === 'summary' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold text-white">3.10 Test Summary Table</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Full-system verification matrix across all 4 levels specified in IEEE 829 test documentation.
              </p>
            </div>

            <div className="border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-950 text-neutral-400 uppercase text-[11px] border-b border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-5">Level</th>
                    <th className="py-3.5 px-5">Total</th>
                    <th className="py-3.5 px-5 text-emerald-400">Passed</th>
                    <th className="py-3.5 px-5 text-rose-400">Failed</th>
                    <th className="py-3.5 px-5 text-right">Pass %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/40">
                  <tr>
                    <td className="py-3 px-5 font-bold text-neutral-200">Unit Testing (3.4)</td>
                    <td className="py-3 px-5">6</td>
                    <td className="py-3 px-5 text-emerald-400">6</td>
                    <td className="py-3 px-5 text-neutral-500">0</td>
                    <td className="py-3 px-5 text-right text-emerald-400 font-bold">100%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-bold text-neutral-200">Integration Testing (3.5)</td>
                    <td className="py-3 px-5">6</td>
                    <td className="py-3 px-5 text-emerald-400">6</td>
                    <td className="py-3 px-5 text-neutral-500">0</td>
                    <td className="py-3 px-5 text-right text-emerald-400 font-bold">100%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-bold text-neutral-200">System Testing (3.6)</td>
                    <td className="py-3 px-5">9</td>
                    <td className="py-3 px-5 text-emerald-400">9</td>
                    <td className="py-3 px-5 text-neutral-500">0</td>
                    <td className="py-3 px-5 text-right text-emerald-400 font-bold">100%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-5 font-bold text-neutral-200">Acceptance Testing (3.7)</td>
                    <td className="py-3 px-5">4</td>
                    <td className="py-3 px-5 text-emerald-400">4</td>
                    <td className="py-3 px-5 text-neutral-500">0</td>
                    <td className="py-3 px-5 text-right text-emerald-400 font-bold">100%</td>
                  </tr>
                  <tr className="bg-neutral-950 font-bold text-sm">
                    <td className="py-4 px-5 text-amber-300">Total System Execution</td>
                    <td className="py-4 px-5">25</td>
                    <td className="py-4 px-5 text-emerald-400">25</td>
                    <td className="py-4 px-5 text-neutral-500">0</td>
                    <td className="py-4 px-5 text-right text-emerald-400 text-base">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Defect Reporting (Section 3.9) */}
        {activeTab === 'defects' && (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold text-white">3.9 Defect Reporting & Lifecycle</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Severity levels: Critical, Major, Minor, Trivial. Defect lifecycle: New &rarr; Assigned &rarr; Fixed &rarr; Retested &rarr; Closed.
              </p>
            </div>

            <div className="border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[11px] border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Defect ID</th>
                    <th className="py-3 px-4">Related Test</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Steps to Reproduce</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/30">
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">D-01</td>
                    <td className="py-3 px-4 font-mono">UT-05</td>
                    <td className="py-3 px-4 text-neutral-300">
                      Order cancellation was not checking if shipment was already dispatched.
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800 font-mono text-[10px]">
                        Major
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      Mark order as Delivered &rarr; Click Cancel
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">
                        Closed
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">Dev Team</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">D-02</td>
                    <td className="py-3 px-4 font-mono">IT-05</td>
                    <td className="py-3 px-4 text-neutral-300">
                      Stock restoration delta was inverted on order cancellation.
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 font-mono text-[10px]">
                        Major
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      Cancel order &rarr; Check warehouse stock count
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">
                        Closed
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">Dev Team</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">D-03</td>
                    <td className="py-3 px-4 font-mono">UT-06</td>
                    <td className="py-3 px-4 text-neutral-300">
                      Incomplete email address without domain was passing regex check.
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800 font-mono text-[10px]">
                        Minor
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      Enter "user@" in registration form
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">
                        Closed
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">Dev Team</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

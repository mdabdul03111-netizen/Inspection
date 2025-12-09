import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [data, setData] = useState([]);
  const [deviceFilter, setDeviceFilter] = useState("");
  const [machineFilter, setMachineFilter] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws);
      setData(json);
    };
    reader.readAsBinaryString(file);
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return (
        (!deviceFilter || row.Device === deviceFilter) &&
        (!machineFilter || row["Machine Type"] === machineFilter)
      );
    });
  }, [data, deviceFilter, machineFilter]);

  const computeFrequencyDiff = (row) => {
    const a = Number(row.AICone || 0);
    const q = Number(row.Qpro || 0);
    return a - q;
  };

  const uniqueDevices = [...new Set(data.map((d) => d.Device))];
  const uniqueMachines = [...new Set(data.map((d) => d["Machine Type"]))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inspection Web App</h1>

      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />

      <div className="grid gap-2 mt-4">
        <select onChange={(e) => setDeviceFilter(e.target.value)}>
          <option value="">Select Device</option>
          {uniqueDevices.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select onChange={(e) => setMachineFilter(e.target.value)}>
          <option value="">Select Machine Type</option>
          {uniqueMachines.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {filteredData.map((row, idx) => (
          <div key={idx} className="border p-3 rounded mb-2">
            <p><b>Device:</b> {row.Device}</p>
            <p><b>Machine Type:</b> {row["Machine Type"]}</p>
            <p><b>AICone Frequency:</b> {row.AICone}</p>
            <p><b>Qpro Frequency:</b> {row.Qpro}</p>
            <p><b>Difference:</b> {computeFrequencyDiff(row)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

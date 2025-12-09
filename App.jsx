import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
    <div className="p-6 grid gap-6">
      <h1 className="text-3xl font-bold">Inspection Web App</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="font-semibold mb-1">Upload Excel</p>
          <Input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
        </div>

        <div>
          <p className="font-semibold mb-1">Filter by Device</p>
          <Select onValueChange={setDeviceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select Device" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDevices.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="font-semibold mb-1">Filter by Machine Type</p>
          <Select onValueChange={setMachineFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select Machine Type" />
            </SelectTrigger>
            <SelectContent>
              {uniqueMachines.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredData.map((row, idx) => (
          <Card key={idx} className="shadow-md rounded-2xl">
            <CardContent className="p-4">
              <p><b>Device:</b> {row.Device}</p>
              <p><b>Machine Type:</b> {row["Machine Type"]}</p>
              <p><b>AICone Frequency:</b> {row.AICone}</p>
              <p><b>Qpro Frequency:</b> {row.Qpro}</p>
              <p className="mt-2 text-lg font-semibold">
                Frequency Difference: {computeFrequencyDiff(row)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textAlign, setTextAlign] = useState("left");

  const fonts = [
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Georgia",
    "Verdana",
    "Courier New",
  ];

  const fontSizes = ["12", "14", "16", "18", "20", "24", "28", "32"];

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-green-200">
        <div className="w-40">
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger>
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-24">
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ToggleGroup
          type="single"
          value={textAlign}
          onValueChange={setTextAlign}
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4  text-black" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4 text-black" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4  text-black" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify">
            <AlignJustify className="h-4 w-4  text-black" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="min-h-[calc(100vh-300px)] w-full relative border border-green-200 rounded-xl overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full min-h-[calc(100vh-300px)] p-6 resize-none focus:outline-none bg-white text-black"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            textAlign: textAlign as "left" | "center" | "right" | "justify",
          }}
          placeholder="Start writing your story..."
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Line, Image as KonvaImage } from "react-konva";

const ART_WIDTH = 380;
const ART_HEIGHT = 420;

function useCanvasPhoto(source: string) {
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const image = new window.Image();
    image.src = source;
    image.onload = () => setPhoto(image);
    return () => { image.onload = null; };
  }, [source]);
  return photo;
}

function coverCrop(image: HTMLImageElement) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = ART_WIDTH / ART_HEIGHT;
  if (sourceRatio > targetRatio) {
    const width = image.naturalHeight * targetRatio;
    return { x: (image.naturalWidth - width) / 2, y: 0, width, height: image.naturalHeight };
  }
  const height = image.naturalWidth / targetRatio;
  return { x: 0, y: (image.naturalHeight - height) / 2, width: image.naturalWidth, height };
}

export function CreativeCanvas({ variant }: { variant: 0 | 1 }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(ART_WIDTH);
  const firstPhoto = useCanvasPhoto("/images/showcase-dental.webp");
  const secondPhoto = useCanvasPhoto("/images/canvas-care-greeting-neutral.webp");
  const photo = variant === 0 ? firstPhoto : secondPhoto;
  const scale = width / ART_WIDTH;

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(Math.min(ART_WIDTH, element.clientWidth)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={container} className="creative-canvas-fit" aria-label={`Brightview Dental ${variant === 0 ? "care-led" : "booking-led"} creative sample`}>
    <Stage width={width} height={ART_HEIGHT * scale} scaleX={scale} scaleY={scale} className="konva-stage">
      <Layer>
        <Rect width={ART_WIDTH} height={ART_HEIGHT} fill="#121212" />
        {photo && <KonvaImage image={photo} x={0} y={0} width={ART_WIDTH} height={ART_HEIGHT} crop={coverCrop(photo)} />}
        <Rect width={ART_WIDTH} height={ART_HEIGHT} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 0, y: 420 }} fillLinearGradientColorStops={[0, "rgba(0,0,0,.73)", .36, "rgba(0,0,0,.05)", .60, "rgba(0,0,0,.04)", 1, "rgba(0,0,0,.96)"]} />
        <Rect x={14} y={14} width={352} height={392} cornerRadius={12} stroke="rgba(255,255,255,.52)" strokeWidth={1} />
        <Circle x={37} y={38} radius={7} fill="#FFFFFF" shadowColor="#FFFFFF" shadowBlur={12} />
        <Text x={53} y={31} text="BRIGHTVIEW" fill="#FFFFFF" fontSize={15} fontStyle="bold" fontFamily="Outfit, Arial" letterSpacing={.5} />
        <Text x={262} y={34} text="DENTAL CARE" fill="#EEEEEE" fontSize={9} fontStyle="bold" fontFamily="Manrope, Arial" letterSpacing={1.1} />
        <Line points={[25, 65, 355, 65]} stroke="rgba(255,255,255,.38)" strokeWidth={1} />
        <Rect x={26} y={88} width={variant === 0 ? 122 : 138} height={23} cornerRadius={12} fill="rgba(18,18,18,.76)" stroke="rgba(255,255,255,.55)" strokeWidth={1} />
        <Text x={38} y={94} text={variant === 0 ? "FEEL GOOD AGAIN" : "CARE THAT FITS"} fill="#EEEEEE" fontSize={9} fontStyle="bold" fontFamily="Manrope, Arial" letterSpacing={.8} />
        <Text x={25} y={121} text={variant === 0 ? "YOUR SMILE.\nYOUR MOMENT." : "YOUR CARE.\nYOUR WAY."} fill="#FFFFFF" fontSize={23} fontStyle="bold" fontFamily="Outfit, Arial" lineHeight={.98} width={205} shadowColor="rgba(0,0,0,.6)" shadowBlur={14} />
        <Line points={[25, 331, 355, 331]} stroke="rgba(255,255,255,.46)" strokeWidth={1} />
        <Text x={27} y={345} text={variant === 0 ? "Feel at ease from hello to checkout." : "Thoughtful care, close to home."} fill="#EEEEEE" fontSize={13} fontFamily="Manrope, Arial" width={320} />
        <Rect x={26} y={373} width={145} height={29} cornerRadius={15} fill="#FFFFFF" />
        <Text x={42} y={381} text="BOOK A VISIT  ↗" fill="#000000" fontSize={11} fontStyle="bold" fontFamily="Manrope, Arial" />
        <Text x={236} y={384} text={variant === 0 ? "SAMPLE · CARE" : "SAMPLE · BOOKING"} fill="#EEEEEE" fontSize={8} fontStyle="bold" fontFamily="Manrope, Arial" letterSpacing={.9} />
      </Layer>
    </Stage>
  </div>;
}

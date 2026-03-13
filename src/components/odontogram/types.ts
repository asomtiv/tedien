export type FaceStatus = 'healthy' | 'decay' | 'restored' | 'absent';

export type FaceName = 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'oclusal';

export type ToothFaces = Record<FaceName, FaceStatus>;

export type ToothOverlay = 'none' | 'extraction' | 'absent' | 'crown';

export interface ToothState {
  faces: ToothFaces;
  overlay: ToothOverlay;
}

export interface Prosthesis {
  id: string;
  teeth: string[];
}

export interface OdontogramData {
  teeth: Record<string, ToothState>;
  prostheses: Prosthesis[];
}

export interface OdontogramProps {
  data: OdontogramData;
  onChange: (data: OdontogramData) => void;
  readOnly?: boolean;
}

export interface ToothProps {
  toothId: string;
  state: ToothState;
  onFaceChange: (face: FaceName, status: FaceStatus) => void;
  onOverlayChange: (overlay: ToothOverlay) => void;
  isUpper: boolean;
  readOnly?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

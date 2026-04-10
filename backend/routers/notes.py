from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Note
from schemas import NoteCreate, NoteResponse, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])

NOTE_NOT_FOUND = "Note not found"


def _get_note_or_404(note_id: int, db: Session) -> Note:
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND)
    return note


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    db_note = Note(title=note.title, content=note.content)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/", response_model=list[NoteResponse])
def list_notes(db: Session = Depends(get_db)):
    return db.query(Note).order_by(Note.id.desc()).all()


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    return _get_note_or_404(note_id, db)


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db)):
    db_note = _get_note_or_404(note_id, db)

    for field, value in note.model_dump(exclude_unset=True).items():
        setattr(db_note, field, value)

    db.commit()
    db.refresh(db_note)
    return db_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = _get_note_or_404(note_id, db)
    db.delete(note)
    db.commit()

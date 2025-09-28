# Define the ORM model for our table

from sqlalchemy import Column, Integer, String, REAL, DECIMAL, Index
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class QSRanking(Base):
    __tablename__ = 'qs_rankings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject = Column(String(100), nullable=False)
    institution = Column(String(255), nullable=False)
    country = Column(String(100))
    # The 2025 rank, split into three parts
    rank_2025_display = Column(String(20))
    rank_2025_start = Column(Integer)
    rank_2025_end = Column(Integer)
    # The 2024 rank, split into three parts
    rank_2024_display = Column(String(20))
    rank_2024_start = Column(Integer)
    rank_2024_end = Column(Integer)
    # Include other relevant metric columns
    score = Column(DECIMAL(4, 1))
    academic_score = Column(DECIMAL(4, 1))
    employer_score = Column(DECIMAL(4, 1))
    # Additional ranking and metric columns
    ar_rank = Column(String(20))
    er_rank = Column(String(20))
    citations = Column(DECIMAL(4, 1))
    cpp_rank = Column(String(20))
    h = Column(DECIMAL(4, 1))
    h_rank = Column(String(20))
    irn = Column(DECIMAL(4, 1))
    irn_rank = Column(String(20))

    # Define the index on the model
    __table_args__ = (
        Index('idx_subject_rank', 'subject', 'rank_2025_start', 'rank_2025_end'),
    )

    def __repr__(self):
        return f"<QSRanking(subject='{self.subject}', rank='{self.rank_2025_display}', institution='{self.institution}')>"

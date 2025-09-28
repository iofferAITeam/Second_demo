import os
import csv
from sqlalchemy.orm import sessionmaker

from src.infrastructure.db.sql import SQLDatabaseConnector
from loguru import logger
from src.domain.sql_models import QSRanking


def parse_rank(rank_str):
    """
    Parses a raw rank string (e.g., '=12', '101-150') into its
    display text and numeric start/end components.
    (This function remains the same as it's pure data processing)
    """
    if not rank_str:
        return None, None, None

    rank_display = rank_str.strip()
    rank_cleaned = rank_display.replace('=', '').strip()

    if not rank_cleaned:
        return rank_display, None, None

    if '-' in rank_cleaned:
        try:
            start, end = map(int, rank_cleaned.split('-'))
            return rank_display, start, end
        except ValueError:
            return rank_display, None, None
    else:
        try:
            rank_num = int(rank_cleaned)
            return rank_display, rank_num, rank_num
        except ValueError:
            return rank_display, None, None


def insert_ranking_data(processed_data):
    """
    Inserts a list of processed ranking data into the SQLite database using SQLAlchemy.

    Args:
        db_name (str): The name of the database file.
        processed_data (list): A list of dictionaries, where each dictionary
                               contains the data for one ranking.
    """
    if not processed_data:
        print("No data to insert.")
        return

    engine = SQLDatabaseConnector()
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Create a list of QSRanking objects from the dictionaries
        ranking_objects = [QSRanking(**data) for data in processed_data]
        
        # Add all objects to the session and commit
        session.bulk_save_objects(ranking_objects)
        session.commit()
        print(f"Successfully inserted {len(ranking_objects)} rows into the database.")

    except Exception as e:
        print(f"Database error during insertion: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    directory = "data/qs_data/"
    # This allows the script to be run directly
    csv_files = [f for f in os.listdir(directory) if f.endswith('.csv')]

    # This list will hold all data from all files before insertion
    all_data_for_db = []

    for filename in csv_files:
        subject_to_process = os.path.splitext(filename)[0] # e.g., "Accounting"
        logger.info(f"\nProcessing data for subject: '{subject_to_process}' from file '{filename}'...")

        try:
            with open(os.path.join(directory, filename), 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # display, start, end 
                    rank_2025_display, rank_2025_start, rank_2025_end = parse_rank(row['2025'])
                    rank_2024_display, rank_2024_start, rank_2024_end = parse_rank(row['2024'])
                    ar_rank = row['AR Rank'] if "AR Rank" in row else row['AR rank']

                    processed_row_dict = {
                        'subject': subject_to_process,
                        'institution': row['Institution'],
                        'country': row['Country / Territory'],
                        'rank_2025_display': rank_2025_display,
                        'rank_2025_start': rank_2025_start,
                        'rank_2025_end': rank_2025_end,
                        'rank_2024_display': rank_2024_display,
                        'rank_2024_start': rank_2024_start,
                        'rank_2024_end': rank_2024_end,
                        'score': float(row['Score']) if row['Score'] else None,
                        'academic_score': float(row['Academic']) if row['Academic'] else None,
                        'employer_score': float(row['Employer']) if row['Employer'] else None,
                        'ar_rank': ar_rank,
                        'er_rank': row['ER Rank'],
                        'citations': float(row['Citations']) if row['Citations'] else None,
                        'cpp_rank': row['CPP Rank'],
                        'h': float(row['H']) if row['H'] else None,
                        'h_rank': row['H Rank'],
                        'irn': float(row['IRN']) if row['IRN'] else None,
                        'irn_rank': row['IRN Rank'],
                    }
                    all_data_for_db.append(processed_row_dict)

        except Exception as e:
            logger.error(f"Error processing file {filename}: {e}")
            continue
    
    if all_data_for_db:
        insert_ranking_data(all_data_for_db)

    print("\nAll files processed successfully.")
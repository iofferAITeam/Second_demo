from pydantic import BaseModel
from typing import List, Literal

class QSSubjectQuery(BaseModel):
    subject: Literal['Dentistry', 'Politics', 'Earth & Marine Sciences', 'Education', 
                          'Pharmacy', 'Materials Science', 'Veterinary Science', 'Linguistics', 
                          'Geophysics', 'Architecture', 'Engineering & Technology', 'Environmental Sciences', 
                          'Engineering - Chemical', 'Development Studies', 'Modern Languages', 'Archaeology', 
                          'Sociology', 'Psychology', 'Anatomy', 'Statistics', 'Economics & Econometrics', 'Anthropology', 
                          'Nursing', 'Life Sciences & Medicine', 'Marketing', 'Business', 'Social Policy', 'Communication', 
                          'Sports-related Subjects', 'English Language', 'History of Art', 'Geography', 'Chemistry', 
                          'Engineering - Civil', 'Music', 'Natural Sciences', 'Library', 'Computer Science', 'Arts & Humanities', 
                          'Performing Arts', 'Accounting', 'Mathematics', 'Engineering - Mineral', 'Art & Design', 'Theology', 
                          'Philosophy', 'Geology', 'Biological', 'Physics', 'History$', 'Engineering - Electrical', 'Medicine',
                            'Data Science', 'Agriculture', 'Classics', 'Petroleum Engineering', 'Engineering - Mechanical', 'Law', 
                            'Hospitality', 'Social Sciences & Management']
    rank: int

class QSRanking(BaseModel):
    institution: str
    rank: int
    country: str
    subject: str
    year: int
    url: str
    description: str
    image_url: str
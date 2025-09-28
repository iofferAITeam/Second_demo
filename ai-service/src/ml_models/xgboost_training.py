import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from sklearn.model_selection import RandomizedSearchCV

labels_category_mapping = {
    'OFFER': 'accept',
    '录取': 'accept',
    '被拒': 'reject',
    '等待': 'unknown',
    float('nan'): 'unknown',
    'Offer': 'accept',
    'Unknown': 'unknown',
    'Admitted': 'accept',
    '其他': 'unknown',
    '撤回': 'unknown',
    'Rejected': 'reject',
    'Accepted': 'accept',
    'Other': 'unknown',
    'Pending': 'unknown',
    'WAITLISTED': 'unknown',
    'OTHER': 'unknown',
    'Waiting': 'unknown',
    '被录取': 'accept',
    '拒': 'reject',
    '面试': 'unknown',
    'REJECT': 'reject',
    'Interview': 'accept',
    '拒绝': 'reject',
    'Rejection': 'reject',
    'DENIED': 'reject',
    'offer': 'accept',
    'Waitlisted': 'accept',
    'WITHDRAWN': 'unknown',
    'other': 'unknown',
    ',被拒': 'reject',
    'WAITLIST': 'unknown',
    'Waitlist': 'unknown',
    'rejected': 'reject',
    'interview': 'unknown',
    'pending': 'unknown',
    '未录取': 'reject',
    'REJECTED': 'reject',
    'withdraw': 'unknown',
    'accepted': 'accept',
    'withdrawn': 'unknown',
    'Refused': 'reject',
    'Reject': 'reject',
    'Withdrawn': 'unknown',
    'admission': 'accept',
    'Admit': 'accept',
    'Admission': 'accept',
    'WAITING': 'unknown',
    'Waiting List': 'unknown',
    '待定': 'accept',
    'Offered': 'accept',
    '录取 (Admitted)': 'accept',
    '被拒 (Rejected)': 'reject',
    'Withdraw': 'unknown',
    '未明确': 'unknown',
    'waiting': 'unknown',
    'admitted': 'accept',
    'OFFERS': 'accept',
    'wait': 'unknown',
    'reject': 'reject',
    'Acceptance': 'accept',
    'Others': 'unknown'
}

final_features = ["id","ranking","academic","ar_rank","employer","er_ank","citations","cpp_rank",
                  "H","H_rank","IRN","IRN Rank","Score","label","country_Australia","country_Austria",
                  "country_Azerbaijan","country_Bangladesh","country_Belgium","country_Canada","country_China (Mainland)",
                  "country_Costa Rica","country_Czechia","country_Denmark","country_Egypt","country_Estonia","country_Finland",
                  "country_France","country_Germany","country_Hong Kong SAR","country_Hong Kong SAR, China","country_Iceland",
                  "country_India","country_Ireland","country_Israel","country_Italy","country_Japan","country_Macao SAR, China"
                  "country_Macau SAR","country_Netherlands","country_New Zealand","country_Nigeria","country_Norway","country_Republic of Korea",
                  "country_Russia","country_Russian Federation","country_Saudi Arabia","country_Serbia","country_Singapore","country_South Africa",
                  "country_Spain","country_Sweden","country_Switzerland","country_Taiwan","country_Turkey","country_Türkiye",
                  "country_United Arab Emirates","country_United Kingdom","country_United States","country_United States of America","country_nan",
                  "qs_category_Accounting","qs_category_Agriculture","qs_category_Anthropology","qs_category_Archaeology","qs_category_Architecture",
                  "qs_category_Art & Design","qs_category_Arts & Humanities","qs_category_Biological","qs_category_Business","qs_category_Chemistry",
                  "qs_category_Classics","qs_category_Communication","qs_category_Computer Science","qs_category_Data Science","qs_category_Dentistry",
                  "qs_category_Development Studies","qs_category_Earth & Marine Sciences","qs_category_Economics & Econometrics","qs_category_Education",
                  "qs_category_Engineering & Technology","qs_category_Engineering - Chemical","qs_category_Engineering - Civil","qs_category_Engineering - Electrical",
                  "qs_category_Engineering - Mechanical","qs_category_Engineering - Mineral","qs_category_English Language","qs_category_Environmental Sciences",
                  "qs_category_Geography","qs_category_Geology","qs_category_Geophysics","qs_category_History of Art","qs_category_History$","qs_category_Hospitality",
                  "qs_category_Law","qs_category_Library","qs_category_Life Sciences & Medicine","qs_category_Linguistics","qs_category_Marketing","qs_category_Materials Science",
                  "qs_category_Mathematics","qs_category_Medicine","qs_category_Modern Languages","qs_category_Music","qs_category_Natural Sciences","qs_category_Nursing",
                  "qs_category_Performing Arts","qs_category_Petroleum Engineering","qs_category_Pharmacy","qs_category_Philosophy","qs_category_Physics","qs_category_Politics",
                  "qs_category_Psychology","qs_category_Social Policy","qs_category_Social Sciences & Management","qs_category_Sociology","qs_category_Sports-related Subjects",
                  "qs_category_Statistics","qs_category_Theology","qs_category_Veterinary Science","gpa_tag","paper_tag","toefl_tag","gre_tag","research_tag","college_type_tag",
                  "recommendation_tag","networking_tag","gpa","gre","gmat","ielts","toefl"]

def extract_scores(text, score_types):
    """
    Extract scores for each score type from a text string.
    
    Args:
        text (str): Input string like "GPA:3.45/5,TOEFL:102"
        score_types (list): List of score types to extract
        
    Returns:
        dict: Dictionary with score types as keys and values (or None if not found)
    """
    if pd.isna(text):
        return {score_type: None for score_type in score_types}
    
    # Create a dictionary to store results
    results = {score_type: None for score_type in score_types}
    
    # Split the text by comma to get individual scores
    pairs = text.split(',')
    
    # Process each pair
    for pair in pairs:
        try:
            score_type, value = pair.split(':')
            if score_type in score_types:
                results[score_type] = value
        except ValueError:
            continue
            
    return results

def extact_data_from_tag(tags):
    tag_info = {}
    tag_info["gpa_tag"] = [2.0 if '中等GPA' in str(tag) else
                            1.0 if '低GPA' in str(tag) else  
                            3.0 if '高GPA' in str(tag) else
                            np.nan for tag in tags]
    
    tag_info["paper_tag"] = [2.0 if '水paper' in str(tag) else
                            1.0 if '无paper' in str(tag) else
                            3.0 if '多pape' in str(tag) else
                            4.0 if '牛paper' in str(tag) else
                            np.nan for tag in tags]
    
    tag_info["toefl_tag"] = [2.0 if '中等语言成绩' in str(tag) else
                            1.0 if '低语言成绩' in str(tag) else  
                            3.0 if '高语言成绩' in str(tag) else
                            np.nan for tag in tags]
    
    tag_info["gre_tag"] = [2.0 if 'M GRE score' in str(tag) else
                        1.0 if 'L GRE score' in str(tag) else
                        3.0 if 'H GRE score' in str(tag) else
                        np.nan for tag in tags]
    
    tag_info["research_tag"] = [1.0 if '丰富科研经历' in str(tag) else
                        0.0 if '无科研经历' in str(tag) else  
                        np.nan for tag in tags]
    
    tag_info["college_type_tag"] = [0.0 if '双非申请（非211非985）' in str(tag) else
                                    0.0 if '双飞' in str(tag) else
                                    2.0 if '海外本科' in str(tag) else
                                    1.0 for tag in tags]

    tag_info["recommendation_tag"] = [1.0 if '国内牛推' in str(tag) else
                                    2.0 if '国外牛推' in str(tag) else
                                    0.0 if '无牛推' in str(tag) else
                                    np.nan for tag in tags]
    
    tag_info["networking_tag"] = [1.0 if '高质量套磁' in str(tag) else
                                  0.0 if '无套磁' in str(tag) else
                                  np.nan for tag in tags]
    
    
    return tag_info

def get_gre_percentile(score, test_type='total'):
    """
    Convert GRE score to percentile based on ETS percentile rankings
    
    Args:
        score (int): GRE score (130-170 for verbal/quant, 260-340 for total)
        test_type (str): 'verbal', 'quant', or 'total'
        
    Returns:
        float: Estimated percentile (0-100)
    """
    # Percentile mappings based on ETS data
    verbal_percentiles = {
        170: 99, 169: 99, 168: 98, 167: 98, 166: 97, 165: 96, 164: 95,
        163: 93, 162: 91, 161: 89, 160: 86, 159: 84, 158: 81, 157: 78,
        156: 74, 155: 69, 154: 65, 153: 60, 152: 56, 151: 51, 150: 46,
        149: 41, 148: 36, 147: 32, 146: 27, 145: 23, 144: 19, 143: 16,
        142: 13, 141: 10, 140: 8, 139: 6, 138: 4, 137: 3, 136: 2,
        135: 1, 134: 1, 133: 1, 132: 1, 131: 1, 130: 1
    }
    
    quant_percentiles = {
        170: 97, 169: 96, 168: 95, 167: 93, 166: 91, 165: 89, 164: 86,
        163: 83, 162: 80, 161: 76, 160: 72, 159: 68, 158: 64, 157: 59,
        156: 54, 155: 49, 154: 44, 153: 39, 152: 34, 151: 29, 150: 24,
        149: 20, 148: 16, 147: 13, 146: 10, 145: 8, 144: 6, 143: 4,
        142: 3, 141: 2, 140: 2, 139: 1, 138: 1, 137: 1, 136: 1,
        135: 1, 134: 1, 133: 1, 132: 1, 131: 1, 130: 1
    }
    
    # Total score percentiles (estimated from verbal + quant combinations)
    total_percentiles = {
        340: 99, 339: 99, 338: 99, 337: 98, 336: 98, 335: 97, 334: 96,
        333: 95, 332: 94, 331: 93, 330: 92, 329: 90, 328: 89, 327: 87,
        326: 85, 325: 83, 324: 81, 323: 78, 322: 75, 321: 72, 320: 69,
        319: 65, 318: 62, 317: 58, 316: 54, 315: 50, 314: 46, 313: 42,
        312: 38, 311: 34, 310: 30, 309: 27, 308: 24, 307: 21, 306: 18,
        305: 15, 304: 13, 303: 11, 302: 9, 301: 7, 300: 6, 299: 5,
        298: 4, 297: 3, 296: 2, 295: 2, 294: 1, 293: 1, 292: 1,
        291: 1
    }
    
    # Select appropriate percentile mapping
    if test_type.lower() == 'verbal':
        percentile_map = verbal_percentiles
    elif test_type.lower() == 'quant':
        percentile_map = quant_percentiles
    else:  # total
        percentile_map = total_percentiles
    
    # Find closest score if exact score not in mapping
    if score in percentile_map:
        return percentile_map[score]
    else:
        # Find nearest available score
        available_scores = sorted(percentile_map.keys())
        closest_score = min(available_scores, key=lambda x: abs(x - score))
        return percentile_map[closest_score]

def normalize_gre_score(score, test_type='total'):
    """
    Normalize GRE score to 0-1 range based on percentile
    
    Args:
        score (int): GRE score
        test_type (str): 'verbal', 'quant', or 'total'
        
    Returns:
        float: Normalized score (0-1)
    """
    percentile = get_gre_percentile(score, test_type)
    return percentile / 100.0

def convert_old_gre_total_to_new(old_total):
    """
    Convert old GRE total score (400-1600) to new GRE total score (260-340)
    
    Args:
        old_total (int): Old GRE total score (400-1600)
        
    Returns:
        int: Estimated new GRE total score (260-340) or None if invalid input
    """
    if pd.isna(old_total) or not isinstance(old_total, (int, float)):
        return None
        
    old_total = int(old_total)
    
    if old_total < 400:
        return old_total
    
    # Validate input range
    if old_total > 1600:
        return None
    
    # Approximate conversion formula based on percentile equivalences
    # New_Score = 260 + (old_total - 400) * (80/1200)
    new_score = 260 + (old_total - 400) * (80/1200)
    
    # Round to nearest integer
    new_score = round(new_score)
    
    # Ensure score is within valid range
    new_score = min(max(new_score, 260), 340)
    
    return new_score


def extract_scores_from_card_label(card_label):
    extracted_scores = card_label.apply(
        lambda x: extract_scores(x, ["GPA","GRE", "GMAT","IELTS", "TOEFL"])
    )   
    all_scores = {
        "gpa": [],
        "gre": [],
        "gmat": [],
        "ielts": [],
        "toefl": []
    }
    for row in extracted_scores:
        if row["GPA"] is not None:
            gpa_score = row["GPA"].split("/")
            if len(gpa_score) == 2:
                all_scores["gpa"].append(float(gpa_score[0])/float(gpa_score[1]))
            else:
                all_scores["gpa"].append(np.nan)
        else:
            all_scores["gpa"].append(np.nan)

        if row["GRE"] is not None:
            gre_score = float(row["GRE"])
            gre_score = convert_old_gre_total_to_new(gre_score)
            # gre_score = normalize_gre_score(gre_score)
            all_scores["gre"].append(gre_score)
        else:
            all_scores["gre"].append(np.nan)

        if row["GMAT"] is not None:
            gmat_score = float(row["GMAT"])
            all_scores["gmat"].append(gmat_score)
        else:
            all_scores["gmat"].append(np.nan)
        
        if row["IELTS"] is not None:
            ielts_score = float(row["IELTS"])
            all_scores["ielts"].append(ielts_score)
        else:
            all_scores["ielts"].append(np.nan)

        if row["TOEFL"] is not None:
            toefl_score = float(row["TOEFL"])
            all_scores["toefl"].append(toefl_score)
        else:
            all_scores["toefl"].append(np.nan)
            
    return all_scores



def preprocess_data():

    offers_table = pd.read_csv("data/machine_learning/offers.csv")
    labels_table = pd.read_csv("data/machine_learning/labels_with_category.csv")


    labels_table["OUTCOME"] = labels_table.decision.map(labels_category_mapping)
    labels_table['label'] = labels_table['OUTCOME'].apply(lambda x: 1 if x == 'accept' else 0)
    
    offers_table["new_tag"] = offers_table['case_content_tag'].map(lambda x: x.split(" · ") if isinstance(x, str) else [])

    all_tags = offers_table["new_tag"].tolist()
    tag_info = extact_data_from_tag(all_tags)
    tag_info = pd.DataFrame(tag_info)

    tag_info['id'] = offers_table['id']

    score_info = extract_scores_from_card_label(offers_table["case_card_label"])
    score_info = pd.DataFrame(score_info)
    score_info['id'] = offers_table['id']

    data_columns  = ['id', 'qs_category',  'country', 'ranking', 'academic', 'ar_rank', 'employer',
                    'er_ank', 'citations', 'cpp_rank', 'H', 'H_rank', 'IRN', 'IRN Rank',
                    'Score',  'label']
    
    data = labels_table[data_columns]
    data.loc[:, "country"] = data["country"].astype(str)
    data.loc[:, "country"] = data["country"].astype(str).str.replace("United States of America", "United States")
    data = pd.get_dummies(data, columns=["country"])

    data.loc[:, "qs_category"] = data["qs_category"].astype(str)
    data = pd.get_dummies(data, columns=["qs_category"])

    data.loc[:, "ranking"] = data["ranking"].astype(str).apply(lambda x: x.split("-")[0])
    data.loc[:, "Score"] = data["Score"].astype(str).replace("-", np.nan)

    numeric_columns = data_columns[3:]
    for col in numeric_columns:
        if col in data.columns:
            data[col] = data[col].astype(str).str.replace("+", "").str.replace("=", "")
            data[col] = data[col].astype(float)


    data = data.merge(tag_info, on="id", how="left")
    data = data.merge(score_info, on="id", how="left")

    return data

def main():
    data = preprocess_data()

    X = data.drop(columns=['id', "label"])
    y = data["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', XGBClassifier(eval_metric='logloss', random_state=42))
    ])

    param_grid = {
        'classifier__n_estimators': [100, 200, 300, 400],
        'classifier__learning_rate': [0.01, 0.05, 0.1, 0.2],
        'classifier__max_depth': [3, 5, 7, 9],
        'classifier__subsample': [0.7, 0.8, 0.9, 1.0],
        'classifier__colsample_bytree': [0.7, 0.8, 0.9, 1.0],
        'classifier__gamma': [0, 0.1, 0.2, 0.3]
    }

    random_search = RandomizedSearchCV(
        pipeline, 
        param_distributions=param_grid, 
        n_iter=50, 
        cv=5, 
        verbose=1, 
        n_jobs=-1, 
        random_state=42
    )

    # 8. Train the Model by running the search
    print("💪 Starting hyperparameter tuning...")
    random_search.fit(X_train, y_train)
    
    # 9. Get the best model and its parameters
    print("\n✅ Tuning complete!")
    print(f"   Best Hyperparameters Found: {random_search.best_params_}")
    best_pipeline = random_search.best_estimator_

    # 10. Evaluate the Best Model
    y_pred = best_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Model evaluation on test set using best model:")
    print(f"   Accuracy: {accuracy:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # 11. Save the Optimized Pipeline and Columns
    print("💾 Saving optimized pipeline and feature columns...")
    joblib.dump(best_pipeline, 'xgboost_pipeline.joblib')
    joblib.dump(list(X.columns), 'feature_columns.joblib')
    print("   - xgboost_pipeline.joblib (The OPTIMIZED model)")
    print("   - feature_columns.joblib (The list of feature names)")

    # 12. Generate and Save Feature Importance Chart from the best model
    print("📊 Generating feature importance chart...")
    feature_names = X.columns
    importances = best_pipeline.named_steps['classifier'].feature_importances_
    
    feature_importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values('importance', ascending=False).head(20)
    
    plt.figure(figsize=(12, 8))
    sns.barplot(x='importance', y='feature', data=feature_importance_df)
    plt.title('Top 20 Feature Importance (from Tuned Model)')
    plt.tight_layout()
    plt.savefig('feature_importance.png')
    print("   - feature_importance.png (Chart saved)")
    print("\n🎉 Training pipeline finished successfully!")


def predict_new_data(data: dict):
    df = pd.read_csv("data/prediction_features.csv")
    features = df.columns.to_list() 
    print(features)



    """Loads the saved pipeline and makes predictions on new data."""
    print("\n🚀 Starting new data prediction...")
    try:
        pipeline = joblib.load('xgboost_pipeline.joblib')
        training_columns = joblib.load('feature_columns.joblib')
        print("   - Loaded saved pipeline and feature columns.")
    except FileNotFoundError:
        print("🔴 Error: Model files not found. Please run the training pipeline first.")
        return None
    
    qs_data = pd.read_csv("data/qs_data/" + data["qs_category"] + ".csv")
   
    qs_data["Country / Territory"] = qs_data["Country / Territory"].str.replace("United States of America", "United States")
    
    qs_data = qs_data[qs_data["Country / Territory"] == data["country"]]
    univeristies = qs_data["Institution"]

    qs_data.rename(columns={"Country / Territory": "country",
                            "2025": "ranking",
                            "Academic": "academic",
                            "AR rank": "ar_rank",
                            "Employer": "employer",
                            "ER Rank": "er_ank",
                            "Citations": "citations",
                            "CPP Rank": "cpp_rank",
                            "H": "H",
                            "H Rank": "H_rank",
                            "International Research Network": "IRN",
                            "IRN Rank": "IRN Rank",
                            "Score": "Score"
                            }, inplace=True)
    

    qs_data = pd.get_dummies(qs_data, columns=["country"])
    qs_data["country_nan"] = False

    qs_columns = [col for col in features if "qs_category_" in col]
    qs_data.loc[:, qs_columns] = False
    qs_data.loc[:, "qs_category_" + data["qs_category"]] = True

    country_columns = [col for col in features if "country_" in col]
    qs_data.loc[:, country_columns] = False

    
    score_features = [
        "gpa_tag", "paper_tag", "toefl_tag", "gre_tag", "research_tag", 
        "college_type_tag", "recommendation_tag", "networking_tag", 
        "gpa", "gre", "gmat", "ielts", "toefl"
    ]

    # This creates all columns at once
    qs_data = qs_data.assign(**{col: data[col] for col in score_features})


    qs_data = qs_data[features]
    

    numeric_columns = ['ranking', 'academic', 'ar_rank', 'employer', 'er_ank', 'citations', 'cpp_rank', 'H', 'H_rank', 'IRN', 'IRN Rank', 'Score']
    qs_data.loc[:, "ranking"] = qs_data["ranking"].astype(str).apply(lambda x: x.split("-")[0])
    qs_data.loc[:, "Score"] = qs_data["Score"].astype(str).replace("-", np.nan)

    for col in numeric_columns:
        if col in qs_data.columns:
            qs_data[col] = qs_data[col].astype(str).str.replace("+", "").str.replace("=", "")
            qs_data[col] = qs_data[col].astype(float)
    

    print("   - Making predictions on new data...")
    predictions = pipeline.predict(qs_data[features])
    probabilities = pipeline.predict_proba(qs_data[features])[:, 1]
    print(probabilities)
    univeristies = univeristies[probabilities > 0.8]

    print(univeristies)

    plt.scatter(qs_data["ranking"], probabilities)
    plt.xlabel("Ranking")
    plt.ylabel("Probability")
    plt.title("Probability of Acceptance")
    plt.savefig("probabilities.png")
    # plt.close()


    

    
    
    # qs_category = qs_category[qs_category["qs_category"] == data["qs_category"]]
    # print(qs_category)





if __name__ == "__main__":
    main()
    # data = {
    #     "country": "United States",
    #     "qs_category": "Business",
    #     "gpa_tag": 1,
    #     "paper_tag": 1,
    #     "toefl_tag": 1,
    #     "gre_tag": 1,
    #     "research_tag": 1,
    #     "college_type_tag": 1,
    #     "recommendation_tag": 1,
    #     "networking_tag": 1,
    #     "gpa": 3.4/4.0,
    #     "gre": np.nan,
    #     "gmat": np.nan,
    #     "ielts": 7.0,
    #     "toefl": np.nan,
    # }
    # predict_new_data(data)

    # data = {
    #     "country": "United States",
    #     "qs_category": "Business",
    #     "gpa_tag": 1,
    #     "paper_tag": 1,
    #     "toefl_tag": 1,
    #     "gre_tag": 1,
    #     "research_tag": 1,
    #     "college_type_tag": 1,
    #     "recommendation_tag": 1,
    #     "networking_tag": 1,
    #     "gpa": 3.8/4.0,
    #     "gre": np.nan,
    #     "gmat": 800,
    #     "ielts": 7.0,
    #     "toefl": np.nan,
    # }
    # predict_new_data(data)



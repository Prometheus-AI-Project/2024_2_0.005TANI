# -*- coding: utf-8 -*-
"""train.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1zscYYfBqpZizGWir-Mvqijuk1BjAz3Zs

출루율 모델 학습
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from keras.callbacks import Callback, EarlyStopping
from keras.optimizers import Adam


########################################
# 1. Top-N Accuracy 계산 함수
########################################
def top_n_accuracy(y_true, y_pred, n=3):
    """
    y_true: (배치, zone_count) 실제 값
    y_pred: (배치, zone_count) 예측 값
    n: Top-N (3, 5 등)
    """
    correct_count = 0
    for true_vector, pred_vector in zip(y_true, y_pred):
        top_n_indices = np.argsort(pred_vector)[-n:]
        true_index = np.argmax(true_vector)
        if true_index in top_n_indices:
            correct_count += 1
    return correct_count / len(y_true)


########################################
# 2. 공통 모델 학습 함수
########################################


class EpochLogger(Callback):
    def __init__(self, interval=10):
        super().__init__()
        self.interval = interval

    def on_epoch_end(self, epoch, logs=None):
        if (epoch + 1) % self.interval == 0:
            print(f"Epoch {epoch + 1}: loss: {logs['loss']:.4f} - mae: {logs['mae']:.4f} - val_loss: {logs['val_loss']:.4f} - val_mae: {logs['val_mae']:.4f}")

class LearningRateScheduler(Callback):
    def __init__(self, initial_lr, decay_rate, interval):
        super().__init__()
        self.initial_lr = initial_lr
        self.decay_rate = decay_rate
        self.interval = interval

    def on_epoch_begin(self, epoch, logs=None):
        if epoch % self.interval == 0 and epoch > 0:
            new_lr = self.model.optimizer.learning_rate * self.decay_rate
            self.model.optimizer.learning_rate.assign(new_lr)
            print(f"Learning rate updated to: {new_lr.numpy():.6f}")

def train_encoder_decoder_model(
    file_path,
    input_cols,
    zone_cols,
    top_n_list=[3, 5],
    epochs=50,
    batch_size=32,
    initial_lr=0.001,
    lr_decay_rate=0.9,
    lr_decay_interval=10
):

    print(f"\n=== 파일: {file_path} ===")
    print(f"입력 컬럼: {input_cols}")

    data = pd.read_csv(file_path)

    data[zone_cols] = data[zone_cols].apply(pd.to_numeric, errors='coerce')

    numeric_cols = data.select_dtypes(include=['number']).columns
    data[numeric_cols] = data[numeric_cols].fillna(0)

    for col in input_cols:
        if col not in data.columns:
            print(f"[경고] {col} 컬럼이 CSV에 없어서 0으로 채웁니다.")
            data[col] = 0

    X = data[input_cols].values
    y = data[zone_cols].values

    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()
    X = scaler_X.fit_transform(X)
    y = scaler_y.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    encoder_inputs = Input(shape=(X.shape[1],))
    encoder = Dense(64, activation='relu')(encoder_inputs)
    encoder = Dense(32, activation='relu')(encoder)

    decoder = Dense(64, activation='relu')(encoder)
    decoder_outputs = Dense(len(zone_cols), activation='linear')(decoder)

    model = Model(encoder_inputs, decoder_outputs)

    optimizer = Adam(learning_rate=initial_lr)
    model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])

    # 사용자 정의 콜백 추가
    epoch_logger = EpochLogger(interval=5)
    lr_scheduler = LearningRateScheduler(initial_lr=initial_lr, decay_rate=lr_decay_rate, interval=lr_decay_interval)

    # Early Stopping 콜백 추가
    early_stopping = EarlyStopping(monitor='val_loss', patience=20, restore_best_weights=True, verbose=1)

    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=epochs,
        batch_size=batch_size,
        verbose=0,  # 에포크별 기본 로그 출력을 끔
        callbacks=[epoch_logger, lr_scheduler, early_stopping]  # 콜백 추가
    )

    y_pred = model.predict(X_test)

    for n in top_n_list:
        acc_n = top_n_accuracy(y_test, y_pred, n=n)
        print(f"Top-{n} Accuracy: {acc_n*100:.2f}%")

    return model, scaler_X

import keras
print(keras.__version__)

zone_cols = [f"{i}" for i in range(1, 26)]


csv_1 = "preprocessed_df_Pitchtype.csv"  # 예: 실제 파일 경로
input_cols_1 = [
    "height",
    "lh_or_rh",
    "pitchtype"
]
model_1, hist_1 = train_encoder_decoder_model(
    file_path=csv_1,
    input_cols=input_cols_1,
    zone_cols=zone_cols,
    top_n_list=[3,5],
    epochs=500,
    batch_size=16,
    initial_lr=0.0005,
    lr_decay_rate=0.9,
    lr_decay_interval=10
)
checkpoint_path = "./Pitchtype_checkpoint.h5"
model_1.save(checkpoint_path)
print(f"Model saved to {checkpoint_path}")

csv_2 = "preprocessed_df_Pitcher.csv"
input_cols_2 = [
    "height",
    "lh_or_rh",
    "pitch_mechanic"
]
model_2, hist_2 = train_encoder_decoder_model(
    file_path=csv_2,
    input_cols=input_cols_2,
    zone_cols=zone_cols,
    top_n_list=[3,5],
    epochs=500,
    batch_size=16,
    initial_lr=0.0005,
    lr_decay_rate=0.9,
    lr_decay_interval=10
)


checkpoint_path = "./Pitcher_checkpoint.h5"
model_2.save(checkpoint_path)
print(f"Model saved to {checkpoint_path}")

csv_3 = "preprocessed_df_Runner.csv"
input_cols_3 = [
    "height",
    "lh_or_rh",
    "runner"
]
model_3, hist_3 = train_encoder_decoder_model(
    file_path=csv_3,
    input_cols=input_cols_3,
    zone_cols=zone_cols,
    top_n_list=[3,5],
    epochs=500,
    batch_size=16,
    initial_lr=0.0005,
    lr_decay_rate=0.9,
    lr_decay_interval=10
)
checkpoint_path = "./Runner_checkpoint.h5"
model_3.save(checkpoint_path)
print(f"Model saved to {checkpoint_path}")

csv_4 = "preprocessed_df_BallCount.csv"
input_cols_4 = [
"height",
"lh_or_rh",
"bc"
]
model_4, hist_4 = train_encoder_decoder_model(
    file_path=csv_4,
    input_cols=input_cols_4,
    zone_cols=zone_cols,
    top_n_list=[3,5],
    epochs=500,
    batch_size=16,
    initial_lr=0.0005,
    lr_decay_rate=0.9,
    lr_decay_interval=10
)

checkpoint_path = "./BallCount_checkpoint.h5"
model_4.save(checkpoint_path)
print(f"Model saved to {checkpoint_path}")

import pickle

# 스케일러 저장
with open('scaler_X_pitchtype.pkl', 'wb') as f:
    pickle.dump(hist_1, f)
with open('scaler_X_pitcher.pkl', 'wb') as f:
    pickle.dump(hist_2, f)
with open('scaler_X_runner.pkl', 'wb') as f:
    pickle.dump(hist_3, f)
with open('scaler_X_ballcount.pkl', 'wb') as f:
    pickle.dump(hist_4, f)

"""구사율 모델 학습"""

import pickle

# 스케일러 저장
with open('scaler_X_pitchtype.pkl', 'wb') as f:
    pickle.dump(hist_1, f)
with open('scaler_X_pitcher.pkl', 'wb') as f:
    pickle.dump(hist_2, f)
with open('scaler_X_runner.pkl', 'wb') as f:
    pickle.dump(hist_3, f)
with open('scaler_X_ballcount.pkl', 'wb') as f:
    pickle.dump(hist_4, f)

import pandas as pd
import numpy as np

# 1) CSV 파일 경로 입력받기
csv_path = "/content/preprocessed_hitmodel_data_ballcount_df.csv"

# 2) CSV 불러오기
df = pd.read_csv(csv_path)

# 3) 조건에 따라 bc 컬럼 생성 (np.select 활용)
conditions = [
    (df['more_strike'] == 1),
    (df['more_ball'] == 1),
    (df['same_strike_ball'] == 1)
]
choices = [0, 1, 2]
df['bc'] = np.select(conditions, choices, default=np.nan)

# 4) 결과 확인
print(df.head())
output_path = "/content/preprocessed_hitmodel_data_ballcount_df.csv"
df.to_csv(output_path, index=False)

import pandas as pd

csv_5 = "preprocessed_hitmodel_data_ballcount_df.csv"
# CSV 파일 읽기
df = pd.read_csv(csv_5)

# Label Encoding
df['lp_or_rp'] = df['lp_or_rp'].map({'L': 0, 'R': 1})

# 변환된 데이터를 다시 CSV 파일로 저장 (필요한 경우)
df.to_csv(csv_5, index=False)

zone_cols = [f"zone{i}" for i in range(1, 26)]
csv_5 = "preprocessed_hitmodel_data_ballcount_df.csv"
input_cols_5 = [
"height",
"lp_or_rp",
"pitch_mechanic",
"bc"
]
model_5, hist_5 = train_encoder_decoder_model(
    file_path=csv_5,
    input_cols=input_cols_5,
    zone_cols=zone_cols,
    top_n_list=[3,5],
    epochs=500,
    batch_size=16,
    initial_lr=0.0005,
    lr_decay_rate=0.9,
    lr_decay_interval=10
)

checkpoint_path = "./hitter_BallCount_checkpoint.h5"
model_5.save(checkpoint_path)
print(f"Model saved to {checkpoint_path}")

import pandas as pd
import numpy as np

# 1) CSV 파일 경로 입력받기
csv_path = "/content/preprocessed_hitmodel_data_lh_or_rh_df.csv"

# 2) CSV 불러오기
df = pd.read_csv(csv_path)

# 3) 조건에 따라 bc 컬럼 생성 (np.select 활용)
conditions = [
    (df['lh'] == 1),
    (df['rh'] == 1)
]
choices = [0, 1]
df['lh_or_rh'] = np.select(conditions, choices, default=np.nan)

# 4) 결과 확인
print(df.head())
output_path = "/content/preprocessed_hitmodel_data_lh_or_rh_df.csv"
df.to_csv(output_path, index=False)

import pandas as pd

# CSV 파일 읽기
df = pd.read_csv("/content/preprocessed_hitmodel_data_lh_or_rh_df.csv")

# Label Encoding
df['lp_or_rp'] = df['lp_or_rp'].map({'L': 0, 'R': 1})

# 변환된 데이터를 다시 CSV 파일로 저장 (필요한 경우)
df.to_csv("/content/preprocessed_hitmodel_data_lh_or_rh_df.csv", index=False)

csv_6 = "/content/preprocessed_hitmodel_data_lh_or_rh_df.csv"
input_cols_6 = [
    "height",
    "lp_or_rp",
    "pitch_mechanic",
    "lh_or_rh"
]
model_6, hist_6 = train_encoder_decoder_model(
    file_path=csv_6,
    input_cols=input_cols_6,
    zone_cols=zone_cols,
    top_n_list=[3,5],
    epochs=500,
    batch_size=16,
    initial_lr=0.0005,
    lr_decay_rate=0.9,
    lr_decay_interval=10
)


checkpoint_path = "./hitter_lh_or_rh_checkpoint.h5"
model_6.save(checkpoint_path)
print(f"Model saved to {checkpoint_path}")

import pandas as pd
import numpy as np

# 1) CSV 파일 경로 입력받기
csv_path = "/content/preprocessed_hitmodel_data_runner_df.csv"

# 2) CSV 불러오기
df = pd.read_csv(csv_path)

# 3) 조건에 따라 bc 컬럼 생성 (np.select 활용)
conditions = [
    (df['is_runner'] == 1),
    (df['no_runner'] == 1)
]
choices = [0, 1]
df['runner'] = np.select(conditions, choices, default=np.nan)

# 4) 결과 확인
print(df.head())
output_path = "/content/preprocessed_hitmodel_data_runner_df.csv"
df.to_csv(output_path, index=False)

import pandas as pd

# CSV 파일 읽기
df = pd.read_csv("/content/preprocessed_hitmodel_data_runner_df.csv")

# Label Encoding
df['lp_or_rp'] = df['lp_or_rp'].map({'L': 0, 'R': 1})

# 변환된 데이터를 다시 CSV 파일로 저장 (필요한 경우)
df.to_csv("/content/preprocessed_hitmodel_data_runner_df.csv", index=False)

csv_7 = "/content/preprocessed_hitmodel_data_runner_df.csv"
input_cols_7 = [
    "height",
    "lp_or_rp",
    "pitch_mechanic",
    "runner"
]
model_7, hist_7 = train_encoder_decoder_model(
    file_path=csv_7,
    input_cols=input_cols_7,
    zone_cols=zone_cols,
    top_n_list=[3,5],
    epochs=500,
    batch_size=16,
    initial_lr=0.0005,
    lr_decay_rate=0.9,
    lr_decay_interval=10
)


checkpoint_path = "./hitter_runner_checkpoint.h5"
model_7.save(checkpoint_path)
print(f"Model saved to {checkpoint_path}")

import pickle

# 스케일러 저장
with open('scaler_X_hit_ballcount.pkl', 'wb') as f:
    pickle.dump(hist_5, f)
with open('scaler_X_hit_lh_or_rh.pkl', 'wb') as f:
    pickle.dump(hist_6, f)
with open('scaler_X_hit_runner.pkl', 'wb') as f:
    pickle.dump(hist_7, f)
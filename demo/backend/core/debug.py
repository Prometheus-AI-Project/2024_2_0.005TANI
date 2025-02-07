import os
import tensorflow as tf

def debug_load_model(model_path, custom_objects=None):
    """
    model_path에 대한 디버깅 정보를 출력한 뒤, load_model을 시도합니다.
    """
    abs_path = os.path.abspath(model_path)

    print("=== Debugging load_model path ===")
    print(f"Given path:       {model_path}")
    print(f"Absolute path:    {abs_path}")
    print(f"Exists?           {os.path.exists(abs_path)}")
    print(f"Is a file?        {os.path.isfile(abs_path)}")
    print(f"Is a directory?   {os.path.isdir(abs_path)}")

    if os.path.isdir(abs_path):
        try:
            contents = os.listdir(abs_path)
        except PermissionError:
            contents = "Permission Denied"
        print(f"Directory contents: {contents}")
    print("=================================")

    # 파일이 실제 존재하고, 파일이 맞다면 로드 시도
    if os.path.isfile(abs_path):
        model = tf.keras.models.load_model(abs_path, custom_objects=custom_objects)
        print("[INFO] Model loaded successfully!")
        return model
    else:
        raise FileNotFoundError(f"[ERROR] Model file not found or is not a file: {abs_path}")


# 예: run_pitcher_model 내부에서 사용
def run_pitcher_model():
    print("start run_pitcher_model")
    custom_objects = {
        'mse': tf.keras.losses.MeanSquaredError()
    }
    
    checkpoint_ballcount = "./checkpoints/pitcher/checkpoint/hitter_BallCount_checkpoint.keras"
    
    # 디버깅 로드 함수 사용 예시
    model_5 = debug_load_model(checkpoint_ballcount, custom_objects=custom_objects)
    # 이후 모델 사용
    # ...
run_pitcher_model()
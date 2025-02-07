
![0 005](https://github.com/user-attachments/assets/3cc590ee-6697-424e-b9fc-e20959e8163c)


## 0. Dataset Overview
The dataset is crawled from Musinsa, focusing on categories like hoodies, coats, and jeans. Using the crawled data, we generated descriptive captions with GPT-40 Mini.

The dataset is structured in the format (snapshot, product image, descriptive caption) to align with the FashionIQ dataset, which is commonly used for model training in fashion-related tasks.

Dataset has the following structure:

```
project_base_path
└───  fashionIQ_dataset
      └─── captions
            | cap.dress.test.json
            | cap.dress.train.json
            | cap.dress.val.json
            | ...
            
      └───  images
            | B00006M009.jpg
            | B00006M00B.jpg
            | B00006M6IH.jpg
            | ...
            
      └─── image_splits
            | split.dress.test.json
            | split.dress.train.json
            | split.dress.val.json
            | ...
```


## 1. Make Dataset
1. Crawling the dataset



2. After generating captions using GPT, structure the dataset





## 2. Environment Setup
For venv users
```
python3.11 -m venv .ohtani
source .ohtaniX/bin/activate
pip3 install numpy==1.26.4 pandas==2.2.2 tensorflow==2.18.0 keras==3.8.0 scikit-learn==1.6.1
pip3 install fastapi uvicorn
```

For conda users
```
conda create -n ohtani python==3.11
conda activate ohtani
pip3 install numpy==1.26.4 pandas==2.2.2 tensorflow==2.18.0 keras==3.8.0 scikit-learn==1.6.1
pip3 install fastapi uvicorn 
```


## 3. Training
```
python src/blip_fine_tune_2.py
```




## 4. Inference 
```sh
python src/blip_validate.py \
   --dataset {'CIRR' or 'FashionIQ'} \
   --blip-model-name {trained model name} \
   --model-path {for path} 
```



## 5. Web page 
```
*Start Both Terminal!

#Terminal 1

(cd demo/web-demo)
npm start

  
#Terminal 2

(cd demo/backend)
uvicorn main:app --reload ( or python main.py )
```

## 6. Checkpoints
Google drive:



## 7. Acknowledgement
Our implementation and development is based on [https://github.com/chunmeifeng/SPRC]


## 8. Members

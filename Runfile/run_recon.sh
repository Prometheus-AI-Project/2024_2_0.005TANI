#!/bin/bash

# Ensure the script has execution permissions
# chmod +x run_recon.sh

export PATH=/usr/local/bin:/usr/bin:/usr/local/cuda/bin:/home/mins/anaconda3/envs/metown/bin:/home/mins/anaconda3/condabin:/home/mins/anaconda3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin

source ~/anaconda3/etc/profile.d/conda.sh

# conda info >> ../Runfile/result.log

# Activate the Python environment (if using conda)
source ~/anaconda3/bin/activate metown

conda info >> ../Runfile/result.log

# Ensure the script is executed from the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Get the source path from the first argument
SOURCE_PATH=$1
echo "Source data: $SOURCE_PATH"

# [3] Glomap
echo "Running the Golmap conversion script..."
python ../gaussian-splatting/convert_glomap.py -s "$SOURCE_PATH"
if [ $? -ne 0 ]; then
    echo "Glomap script failed"
    exit 1
fi
echo "Glomap completed."

# [4] Background Removal
echo "Running the Background Removal script..."
python ../gaussian-splatting/mask_generator/generate_mask.py --ckpt_path ../BGRemoval/ckpt_base.pth --data "$SOURCE_PATH"
if [ $? -ne 0 ]; then
    echo "Background Removal script failed"
    exit 1
fi
echo "Background Removal completed."

# [5] 3DGS
echo "Training 3DGS..."
python ../gaussian-splatting/train.py --save_iterations 7000 10000 15000 30000 45000 60000 90000 120000 180000 240000 --densify_grad_threshold 0.0002 --sh_degree 0 --densify_until_iter 60000 --mask_until_iter 240000 --use_shifted_project -r 4 --dataset_use_ratio 1 --ours --scaleReg --color_mlp --render_one_side --blur 0 --white_background -s "$SOURCE_PATH"
if [ $? -ne 0 ]; then
    echo "3DGS script failed"
    exit 1
fi
echo "3DGS completed."

# Deactivate the Python environment if needed
# source deactivate

# PlotHub

## Interactive Differential Expression Analysis Visualization Tool

PlotHub is an advanced web application designed to visualize differential expression analysis data through multiple interactive visual representations. Hosted on Cloudflare Pages, PlotHub provides researchers and bioinformaticians with an intuitive platform to explore and interpret their genomic data.

**Live Demo**: [https://plothub.pages.dev/](https://plothub.pages.dev/)

## Features

- **Volcano Plot**: Visualize the relationship between log2 fold change and p-value/FDR to quickly identify statistically significant gene expression changes
- **MA Plot**: Explore the relationship between average expression intensity and fold change to identify expression patterns
- **Bar Plot**: Compare intensity values across all experimental conditions with customizable visualization options
- **Interactive Results Table**: Browse, filter, and export your differential expression analysis results with ease

## Current Support

PlotHub currently supports visualization for experiments comparing two conditions with any number of replicates.

## File Format Requirements

### Accepted File Type
- Comma Separated Values (.csv)

### Required Column Structure
Your CSV file must include the following columns in order:

| Column | Description |
|--------|-------------|
| **Gene_acc** | Unique integer identifier for each gene (not displayed in results) |
| **Gene_id** | Alphanumeric string indicating gene/protein ID for visualization |
| **logFC** | Decimal value indicating log2 fold change between conditions |
| **log_AveExpr** | Decimal value representing log10 average intensity |
| **FDR** | Decimal value detailing the false discovery rate |
| **Desc** | Descriptive text for gene or protein groups |

### Intensity Columns
Following the required columns, include intensity values for each condition and replicate:

- Format: `{condition}_{replica}`
  - `{condition}`: Label for the experimental condition
  - `{replica}`: Integer indicating the replicate number

Example headers: `A_1`, `A_2`, `A_3`, `B_1`, `B_2`, `B_3` for two conditions (A and B) with three replicates each.

## Example Data Format

```
Gene_acc,Gene_id,logFC,log_AveExpr,FDR,Desc,A_1,A_2,A_3,B_1,B_2,B_3
1001,BRCA1,2.5,4.8,0.001,"Breast cancer type 1 susceptibility protein",125.6,130.2,128.4,350.3,342.1,348.7
1002,TP53,-1.7,5.2,0.003,"Cellular tumor antigen p53",450.3,442.8,448.6,145.2,140.7,143.8
```

## Getting Started

1. Prepare your differential expression data in CSV format according to the requirements
2. Visit [https://plothub.pages.dev/](https://plothub.pages.dev/)
3. Upload your CSV file using the file uploader
4. Explore your data through the various visualization options




package com.sunno;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
	
	WebView webView;
	private String webUrl = "file:///android_asset/files/index.html";
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		// Initialize WebView
		webView = (WebView) findViewById(R.id.myWebView);
		
		// Set WebView settings
		WebSettings webSettings = webView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		//webView.settings.javaScriptEnabled = true
	//	webSettings.setDomStorageEnabled(true);
		webSettings.setDomStorageEnabled(true);
		// Bypass CORS (Not recommended for production)
		webSettings.setAllowFileAccessFromFileURLs(true);
		webSettings.setAllowUniversalAccessFromFileURLs(true);
	//	webView.settings.javaScriptEnabled = true
        webSettings.setAllowFileAccess(true);
        //webView.settings.domStorageEnabled = true

        // Enable no-cors for scraping external data
      //  webView.settings.allowUniversalAccessFromFileURLs = true
     //   webView.settings.allowFileAccessFromFileURLs = true


		
		// Check if API level is 21 or higher to set mixed content mode
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
			webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
		}
		
		// Set WebViewClient to handle loading URLs inside the WebView
		webView.setWebViewClient(new WebViewClient() {
			@Override
			public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
					view.loadUrl(request.getUrl().toString());
					} else {
					view.loadUrl(request.toString());
				}
				return true;
			}
			
			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				// For backward compatibility with lower API levels
				view.loadUrl(url);
				return true;
			}
		});
		
		// Load the initial URL
		webView.loadUrl(webUrl);
	}
	
	@Override
	public void onBackPressed() {
		// Check if WebView can go back
		if (webView.canGoBack()) {
			webView.goBack();
			} else {
			// Otherwise, handle back press as usual
			super.onBackPressed();
		}
	}
}